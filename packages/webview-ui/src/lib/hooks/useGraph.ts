import {
  Connection,
  ConnectionLineType,
  Edge,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import equal from 'fast-deep-equal';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DiagramSettings } from '../contexts/settings';
import { MyNode } from '../types/schema';
import { getLayoutedElements } from '../utils/layout-utils';

const DEFAULT_LAYOUT = 'TB';

export const useGraph = (
  initialNodes: MyNode[],
  initialEdges: Edge[],
  settings: DiagramSettings,
) => {
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedLayout, setSelectedLayout] = useState<string>(DEFAULT_LAYOUT);

  const [shouldFitView, setShouldFitView] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isFirstRender = useRef(true);

  const applyLayout = useCallback(
    (
      layoutDirection: string,
      fromNodes = nodes,
      fromEdges = edges,
      isInitial = false,
    ) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(fromNodes, fromEdges, layoutDirection);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      if (isInitial) {
        // For initial render, be more direct but still use better settings
        setIsReady(true);
        setShouldFitView(true);
      } else {
        setShouldFitView(true);
      }
    },
    [nodes, edges, setNodes, setEdges],
  );

  const onLayout = useCallback(
    (direction: string) => {
      applyLayout(direction);
      setSelectedLayout(direction);
    },
    [applyLayout],
  );

  // Apply layout from settings automatically
  useEffect(() => {
    if (settings?.layout && settings.layout !== selectedLayout) {
      applyLayout(settings.layout);
      setSelectedLayout(settings.layout);
    }
  }, [settings?.layout, selectedLayout, applyLayout]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: ConnectionLineType.SmoothStep,
            animated: true,
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  useEffect(() => {
    if (!initialNodes?.length && !initialEdges?.length) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      applyLayout(DEFAULT_LAYOUT, initialNodes, initialEdges, true);
      return;
    }

    const nodesChanged = !equal(
      initialNodes.map((n) => n.data),
      nodes.map((n) => n.data),
    );
    const edgesChanged = !equal(
      initialEdges.map((e) => ({ source: e.source, target: e.target })),
      edges.map((e) => ({ source: e.source, target: e.target })),
    );

    if (nodesChanged || edgesChanged) {
      applyLayout(selectedLayout, initialNodes, initialEdges);
    }
  }, [initialNodes, initialEdges, applyLayout, selectedLayout, nodes, edges]);

  useEffect(() => {
    if (shouldFitView) {
      // Use requestAnimationFrame to ensure the nodes are rendered before fitting view
      requestAnimationFrame(() => {
        setTimeout(() => {
          fitView({
            padding: 0.2,
            minZoom: 0.1,
            duration: 800,
          });
        }, 100);
      });
      setShouldFitView(false);
    }
  }, [shouldFitView, fitView, isReady]);

  useEffect(() => {
    const deleteDiv = document.getElementsByClassName(
      'react-flow__panel react-flow__attribution bottom right',
    );

    if (deleteDiv.length > 0) {
      deleteDiv[0].remove();
    }
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onLayout,
    setNodes,
    setEdges,
    selectedLayout,
  };
};
