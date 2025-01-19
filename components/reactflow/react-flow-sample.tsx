'use client'

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ArrowRight, ArrowLeft } from 'lucide-react'  // Importing Arrow icons

const initialNodes = [
  { id: '1', type: 'input', data: { label: '🤖 My AI Agent' }, position: { x: 250, y: 25 } },
]

const initialEdges = []

const toolboxNodes = [
  { id: 'tool-2', label: 'Deploy SPL Tokens (Metaplex)' },
  { id: 'tool-3', label: 'Transfer Assets' },
  { id: 'tool-4', label: 'Balance Checks' },
  { id: 'tool-5', label: 'Stake SOL' },
  { id: 'tool-6', label: 'ZK Compressed Airdrop' },
  { id: 'tool-7', label: 'Create NFT Collection' },
  { id: 'tool-8', label: 'Mint and List NFTs' },
  { id: 'tool-9', label: 'List NFT for Sale' },
  { id: 'tool-10', label: 'NFT Metadata Management' },
  { id: 'tool-11', label: 'Royalty Configuration' },
  { id: 'tool-12', label: 'Jupiter Exchange Swaps' },
  { id: 'tool-13', label: 'Raydium Pool Creation' },
  { id: 'tool-14', label: 'Orca Whirlpool Integration' },
  { id: 'tool-15', label: 'Manifest Market (Limit Orders)' },
  { id: 'tool-16', label: 'Pyth Price Feeds' },
  { id: 'tool-17', label: 'Drift Vaults and Perps' },
  { id: 'tool-18', label: 'Gib Work' },
  { id: 'tool-19', label: 'Register/Resolve SNS' },
  { id: 'tool-20', label: 'Solayer sSOL Staking' },
]

function Toolbox({ onDrop, isVisible, toggleVisibility }) {
  return (
    <div
      style={{
        width: isVisible ? '250px' : '0',
        padding: isVisible ? '10px' : '0',
        borderRight: '1px solid #ccc',
        height: '100%',
        overflowY: 'auto',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Toggle button for toolbox visibility using ArrowRight and ArrowLeft */}
      <button
        onClick={toggleVisibility}
        style={{
          position: 'absolute',
          top: '50%',
          left: isVisible ? '100%' : '0',
          transform: isVisible ? 'translateX(-100%)' : 'translateX(0)',
          padding: '8px',
          backgroundColor: '#ccc',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px',
          transition: 'transform 0.3s ease',
          zIndex: 10,
        }}
      >
        {isVisible ? (
          <ArrowLeft size={20} />  // ArrowLeft icon when toolbox is open
        ) : (
          <ArrowRight size={20} />  // ArrowRight icon when toolbox is closed
        )}
      </button>

      {isVisible && (
        <>
          <h4>Toolbox</h4>
          {toolboxNodes.map((node) => (
            <div
              key={node.id}
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', node.id)}
              draggable
              style={{
                padding: '10px',
                margin: '10px 0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'grab',
              }}
            >
              {node.label}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default function MyReactFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [isToolboxVisible, setIsToolboxVisible] = useState(true)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const reactFlowBounds = event.target.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode = {
        id: `${type}-${+new Date()}`,
        data: { label: toolboxNodes.find((node) => node.id === type)?.label },
        position,
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const toggleToolboxVisibility = () => {
    setIsToolboxVisible((prev) => !prev)
  }

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '90vh' }}>
        <Toolbox
          isVisible={isToolboxVisible}
          toggleVisibility={toggleToolboxVisibility}
          onDrop={undefined}
        />
        <div
          style={{
            flex: 1,
            height: '100%',
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background gap={12} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  )
}
