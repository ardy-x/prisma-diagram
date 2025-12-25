import { getDMMF, loadSchemaContext } from '@prisma/internals';
import * as vscode from 'vscode';
import { transformDmmfToModelsAndConnections } from './core/render';
import { PrismaUMLPanel } from './panels/prisma-uml-panel';
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Prisma Diagram');
  outputChannel.appendLine('Prisma Diagram extension activated');

  const disposable = vscode.commands.registerCommand(
    'prismaDiagram.showDiagram',
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor && editor.document.languageId === 'prisma') {
        const currentFileUri = editor.document.uri;

        try {
          await generateUMLForPrismaFile(context, currentFileUri);
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to generate UML: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      } else {
        vscode.window.showInformationMessage(
          'Open a .prisma file to use this command',
        );
      }
    },
  );

  const onDidSaveDisposable = vscode.workspace.onDidSaveTextDocument(
    async (document) => {
      if (document.languageId === 'prisma' && PrismaUMLPanel.currentPanel) {
        try {
          await generateUMLForPrismaFile(context, document.uri);
        } catch (error) {
          console.error('Failed to update UML on save:', error);
        }
      }
    },
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(onDidSaveDisposable);
}

async function generateUMLForPrismaFile(
  context: vscode.ExtensionContext,
  fileUri: vscode.Uri,
) {
  const folderUri = vscode.Uri.joinPath(fileUri, '..');

  let response: Awaited<ReturnType<typeof getDMMF>> | null = null;

  try {
    const schemaContext = await loadSchemaContext({
      schemaPath: { baseDir: folderUri.fsPath },
    });
    response = await getDMMF({ datamodel: schemaContext.schemaFiles });
    outputChannel.appendLine('Successfully parsed schema from directory');
  } catch (err) {
    outputChannel.appendLine(
      `[prisma-diagram] Failed to load schema: ${err}`
    );
  }

  if (!response) {
    throw new Error(
      'No valid Prisma schema found. Make sure your schema file is valid and contains at least one model.',
    );
  }

  const { models, connections, enums } =
    transformDmmfToModelsAndConnections(response);

  outputChannel.appendLine(
    `Found ${models.length} models, ${connections.length} connections, ${enums.length} enums`,
  );

  PrismaUMLPanel.render(
    context.extensionUri,
    models,
    connections,
    enums,
    fileUri,
  );
}

export function deactivate() {}
