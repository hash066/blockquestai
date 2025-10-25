import { useState, useEffect, useRef } from 'react';
import { keccak256 } from 'ethers';

export default function MerkleProofViz({ proofData }) {
  const canvasRef = useRef(null);
  const [tree, setTree] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Extract data from your API response
  useEffect(() => {
    if (!proofData) return;

    // Build visualization data structure
    const { merkle_proof, leaf_hash, root } = proofData;
    
    const nodes = [];
    const links = [];
    let nodeId = 0;

    // Add target leaf
    const targetNode = {
      id: nodeId++,
      hash: leaf_hash,
      level: 0,
      type: 'target',
      label: 'Your Commit'
    };
    nodes.push(targetNode);

    let currentNode = targetNode;
    let currentHash = leaf_hash;

    // Build tree from proof path
    merkle_proof.forEach((proofNode, index) => {
      const siblingNode = {
        id: nodeId++,
        hash: proofNode.hash,
        level: index + 1,
        type: 'proof',
        position: proofNode.position,
        label: `Proof ${index + 1}`
      };
      nodes.push(siblingNode);

      // Create parent node
      const parentHash = hashPair(
        proofNode.position === 'left' ? proofNode.hash : currentHash,
        proofNode.position === 'left' ? currentHash : proofNode.hash
      );

      const parentNode = {
        id: nodeId++,
        hash: parentHash,
        level: index + 1,
        type: index === merkle_proof.length - 1 ? 'root' : 'intermediate',
        label: index === merkle_proof.length - 1 ? 'Root' : `Level ${index + 1}`
      };
      nodes.push(parentNode);

      // Create links
      links.push({
        source: currentNode.id,
        target: parentNode.id,
        type: 'proof-path'
      });
      links.push({
        source: siblingNode.id,
        target: parentNode.id,
        type: 'sibling'
      });

      currentNode = parentNode;
      currentHash = parentHash;
    });

    setTree({ nodes, links });
  }, [proofData]);

  // Hash pair helper
  const hashPair = (left, right) => {
    const sorted = [left, right].sort();
    return keccak256(
      Buffer.concat([
        Buffer.from(sorted[0].replace('0x', ''), 'hex'),
        Buffer.from(sorted[1].replace('0x', ''), 'hex')
      ])
    );
  };

  // Draw canvas visualization
  useEffect(() => {
    if (!tree || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate positions
    const levelHeight = height / (tree.nodes.length > 0 ? Math.max(...tree.nodes.map(n => n.level)) + 2 : 1);
    const nodePositions = new Map();

    // Group nodes by level
    const nodesByLevel = {};
    tree.nodes.forEach(node => {
      if (!nodesByLevel[node.level]) nodesByLevel[node.level] = [];
      nodesByLevel[node.level].push(node);
    });

    // Position nodes
    Object.keys(nodesByLevel).forEach(level => {
      const nodesInLevel = nodesByLevel[level];
      const levelWidth = width / (nodesInLevel.length + 1);
      nodesInLevel.forEach((node, index) => {
        nodePositions.set(node.id, {
          x: levelWidth * (index + 1),
          y: height - (level * levelHeight) - 50
        });
      });
    });

    // Draw links
    tree.links.forEach(link => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.strokeStyle = link.type === 'proof-path' ? '#10b981' : '#6b7280';
        ctx.lineWidth = link.type === 'proof-path' ? 3 : 1.5;
        ctx.stroke();
      }
    });

    // Draw nodes
    tree.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
      
      // Color based on type
      const colors = {
        target: '#f59e0b',
        proof: '#8b5cf6',
        root: '#10b981',
        intermediate: '#6b7280'
      };
      ctx.fillStyle = colors[node.type] || '#6b7280';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, pos.x, pos.y - 35);

      // Hash (shortened)
      ctx.font = '10px monospace';
      const shortHash = `${node.hash.slice(0, 6)}...${node.hash.slice(-4)}`;
      ctx.fillText(shortHash, pos.x, pos.y + 45);
    });

  }, [tree]);

  return (
    <div className="merkle-viz-container">
      <style jsx>{`
        .merkle-viz-container {
          width: 100%;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .viz-header {
          color: white;
          margin-bottom: 20px;
        }

        .viz-header h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .viz-header p {
          margin: 0;
          opacity: 0.7;
          font-size: 14px;
        }

        .canvas-wrapper {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        canvas {
          width: 100%;
          height: 500px;
          border-radius: 8px;
        }

        .legend {
          display: flex;
          gap: 20px;
          margin-top: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 14px;
        }

        .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .legend-dot.target { background: #f59e0b; }
        .legend-dot.proof { background: #8b5cf6; }
        .legend-dot.root { background: #10b981; }
        .legend-dot.intermediate { background: #6b7280; }

        @media (max-width: 768px) {
          canvas {
            height: 400px;
          }
        }
      `}</style>

      <div className="viz-header">
        <h2>🌳 Merkle Proof Visualization</h2>
        <p>Visual representation of the cryptographic proof path</p>
      </div>

      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={1000} 
          height={500}
        />
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot target"></div>
          <span>Your Commit (Target Leaf)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot proof"></div>
          <span>Proof Nodes (Required for Verification)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot intermediate"></div>
          <span>Intermediate Nodes</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot root"></div>
          <span>Merkle Root (On-Chain)</span>
        </div>
      </div>

      {proofData && (
        <div style={{ marginTop: '20px', color: 'white', fontSize: '14px' }}>
          <p><strong>Proof Efficiency:</strong> {proofData.merkle_proof?.length || 0} hashes needed (log₂ complexity)</p>
          <p><strong>Root Hash:</strong> <code style={{background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px'}}>{proofData.root?.slice(0, 20)}...</code></p>
        </div>
      )}
    </div>
  );
}
