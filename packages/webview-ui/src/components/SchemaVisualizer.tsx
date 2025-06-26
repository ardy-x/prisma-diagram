import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ControlButton,
  Controls,
  Edge,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { useMemo } from 'react';
import { useSettings } from '../lib/contexts/settings';
import { useTheme } from '../lib/contexts/theme';
import { useGraph } from '../lib/hooks/useGraph';
import { Enum, Model, ModelConnection } from '../lib/types/schema';
import { maskColor, nodeColor, nodeStrokeColor } from '../lib/utils/colots';
import { screenshot } from '../lib/utils/screnshot';
import { EnumNode } from './EnumNode';
import { ModelNode } from './ModelNode';
import { SettingsPanel } from './SettingsPanel';
import { IDownload } from './icons/IDownload';

interface Props {
  models: Model[];
  connections: ModelConnection[];
  enums: Enum[];
}

export const SchemaVisualizer = ({ connections, models, enums }: Props) => {
  const { isDarkMode } = useTheme();
  const { getNodes } = useReactFlow();
  const { settings } = useSettings();

  const modelNodes = useMemo(() => {
    return models.map((model) => ({
      id: model.name,
      data: model,
      type: 'model',
      position: { x: 0, y: 0 },
    }));
  }, [models]);

  const enumNodes = useMemo(() => {
    return enums.map((enumItem) => ({
      id: enumItem.name,
      data: enumItem,
      type: 'enum',
      position: { x: 0, y: 0 },
    }));
  }, [enums]);

  const edges: Edge[] = useMemo(() => {
    return connections.map((connection) => ({
      id: `${connection.source}-${connection.target}`,
      source: connection.source.split('-')[0],
      target: connection.target.split('-')[0],
      sourceHandle: connection.source,
      targetHandle: connection.target,
      animated: false,

      style: {
        stroke: isDarkMode ? '#ffffff' : '#000000',
        strokeWidth: 2,
        strokeOpacity: 0.5,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
        strokeDasharray: '5',
        strokeDashoffset: 0,
        fill: 'none',
      },
    }));
  }, [connections]);

  const {
    nodes,
    edges: edgesState,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useGraph([...modelNodes, ...enumNodes], edges, settings);

  const getBackgroundVariant = () => {
    switch (settings.backgroundVariant) {
      case 'dots':
        return BackgroundVariant.Dots;
      case 'cross':
        return BackgroundVariant.Cross;
      default:
        return BackgroundVariant.Lines;
    }
  };

  // Set CSS variables for dynamic theming
  const containerStyle = {
    '--background-color':
      settings.theme.backgroundColor || (isDarkMode ? '#1c1c1c' : '#e0e0e0'),
    '--primary-color': settings.theme.primaryColor,
    '--secondary-color': settings.theme.secondaryColor,
    '--title-color': settings.theme.titleColor,
  } as React.CSSProperties;

  return (
    <div
      className="h-[100vh] w-full relative dynamic-background"
      style={containerStyle}
    >
      <ReactFlow
        onlyRenderVisibleElements
        colorMode={isDarkMode ? 'dark' : 'light'}
        nodes={nodes}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ model: ModelNode, enum: EnumNode }}
        connectionLineType={ConnectionLineType.SmoothStep}
        minZoom={0.2}
      >
        <Controls>
          <ControlButton
            title="Download Screenshot"
            onClick={() => screenshot(getNodes as any)}
          >
            <IDownload color={isDarkMode ? 'white' : 'black'} />
          </ControlButton>
        </Controls>

        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={nodeColor(isDarkMode)}
          nodeStrokeColor={nodeStrokeColor(isDarkMode)}
          maskColor={maskColor(isDarkMode)}
          style={{
            backgroundColor: settings.theme.backgroundColor,
            display: settings.showMinimap ? 'block' : 'none',
          }}
        />

        <Background
          color={isDarkMode ? '#222' : '#ccc'}
          variant={getBackgroundVariant()}
          style={{
            opacity: settings.showBackground ? 1 : 0,
            pointerEvents: settings.showBackground ? 'auto' : 'none',
          }}
        />
      </ReactFlow>

      <SettingsPanel />
    </div>
  );
};
