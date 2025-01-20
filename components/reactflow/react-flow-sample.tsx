/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowRight, ArrowLeft } from 'lucide-react'

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: '🤖 My AI Agent' },
    position: { x: 250, y: 25 },
    className: 'text-gray-800 bg-white dark:text-gray-100 dark:bg-gray-800', // Tailwind equivalent
  },
]

const initialEdges: any[] = []

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

function Toolbox({ isVisible, toggleVisibility }: { isVisible: boolean; toggleVisibility: () => void }) {
  return (
    <div
      className={`transition-width duration-300 ease-in-out h-full overflow-y-auto border-r border-gray-300 dark:border-gray-700 ${
        isVisible ? 'w-64 p-4' : 'w-0 p-0'
      }`}
    >
      <button
        onClick={toggleVisibility}
        className={`absolute top-1/2 -translate-y-1/2 p-2 bg-gray-300 dark:bg-gray-700 rounded shadow-md cursor-pointer z-10 group ${
          isVisible ? 'left-64' : 'left-0'
        }`}
      >
        {isVisible ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
        <span
          className="absolute top-1/2 left-full ml-2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
        >
          {isVisible ? 'Close Toolbox' : 'Open Toolbox'}
        </span>
      </button>


      {isVisible && (
        <>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Toolbox</h4>
          {toolboxNodes.map((node) => (
            <div
              key={node.id}
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', node.id)}
              draggable
              className="p-2 my-2 border border-gray-300 dark:border-gray-700 rounded cursor-grab text-gray-800 dark:text-gray-200"
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
    (event: any) => {
      event.preventDefault()
      const reactFlowWrapper = event.target.closest('.react-flow')
      const reactFlowBounds = reactFlowWrapper.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode = {
        id: `${type}-${+new Date()}`,
        type: 'default',
        data: { label: toolboxNodes.find((node) => node.id === type)?.label ?? 'Default Label' },
        position,
        className: 'text-gray-800 bg-white dark:text-gray-100 dark:bg-gray-800', // Tailwind equivalent
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  const onDragOver = useCallback((event: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const toggleToolboxVisibility = () => {
    setIsToolboxVisible((prev) => !prev)
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-[90vh]">
        <Toolbox isVisible={isToolboxVisible} toggleVisibility={toggleToolboxVisibility} />
        <div
          className="react-flow flex-1 h-full"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            colorMode='dark'
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
