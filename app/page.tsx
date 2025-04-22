"use client"

export class Mesh {
  constructor(vertices: any[], faces: any[]) {
    this.vertices = vertices;
    this.faces = faces;
    this.isTriangular = faces.every((face: string | any[]) => face.length === 3);
  }

  clone() {
    return new Mesh(
      this.vertices.map((v: any) => [...v]), 
      this.faces.map((f: any) => [...f])
    );
  }

  subdivide() {
    if (this.isTriangular) {
      return this._loopSubdivision();
    } else {
      return this._catmullClarkSubdivision();
    }
  }

  _loopSubdivision() {
    const newVertices = [...this.vertices];
    const edgePoints = new Map();
    const newFaces = [];

    for (const face of this.faces) {
      for (let i = 0; i < 3; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % 3];
        const edge = [Math.min(v1, v2), Math.max(v1, v2)].toString();

        if (!edgePoints.has(edge)) {
          const midpoint = [
            (this.vertices[v1][0] + this.vertices[v2][0]) / 2,
            (this.vertices[v1][1] + this.vertices[v2][1]) / 2,
            (this.vertices[v1][2] + this.vertices[v2][2]) / 2
          ];
          edgePoints.set(edge, newVertices.length);
          newVertices.push(midpoint);
        }
      }
    }

    for (const face of this.faces) {
      const v0 = face[0];
      const v1 = face[1];
      const v2 = face[2];

      const e01 = edgePoints.get([Math.min(v0, v1), Math.max(v0, v1)].toString());
      const e12 = edgePoints.get([Math.min(v1, v2), Math.max(v1, v2)].toString());
      const e20 = edgePoints.get([Math.min(v2, v0), Math.max(v2, v0)].toString());

      newFaces.push([v0, e01, e20]);
      newFaces.push([v1, e12, e01]);
      newFaces.push([v2, e20, e12]);
      newFaces.push([e01, e12, e20]);
    }

    return new Mesh(newVertices, newFaces);
  }

  _catmullClarkSubdivision() {
    const newVertices = [...this.vertices];
    const newFaces: any[][] = [];
    
    const facePoints = this.faces.map((face: string | any[]) => {
      const avgPoint = [0, 0, 0];
      for (const vertexIdx of face) {
        const vertex = this.vertices[vertexIdx];
        avgPoint[0] += vertex[0] / face.length;
        avgPoint[1] += vertex[1] / face.length;
        avgPoint[2] += vertex[2] / face.length;
      }
      return avgPoint;
    });
    
    const edgeToFaces = new Map(); 
    const edgeToPoints = new Map(); 
    
    this.faces.forEach((face: string | any[], faceIdx: any) => {
      for (let i = 0; i < face.length; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % face.length];
        const edge = [Math.min(v1, v2), Math.max(v1, v2)].toString();
        
        if (!edgeToFaces.has(edge)) {
          edgeToFaces.set(edge, []);
        }
        edgeToFaces.get(edge).push(faceIdx);
      }
    });
    
    for (const [edgeStr, faceIndices] of edgeToFaces.entries()) {
      const [v1, v2] = edgeStr.split(',').map(Number);
      
      const edgePoint = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        edgePoint[i] = (this.vertices[v1][i] + this.vertices[v2][i]) / 2;
      }
      
      if (faceIndices.length === 2) {
        for (let i = 0; i < 3; i++) {
          edgePoint[i] = (this.vertices[v1][i] + this.vertices[v2][i] +
                          facePoints[faceIndices[0]][i] + facePoints[faceIndices[1]][i]) / 4;
        }
      }
      
      edgeToPoints.set(edgeStr, newVertices.length);
      newVertices.push(edgePoint);
    }
    
    const facePointStartIdx = newVertices.length;
    newVertices.push(...facePoints);
    
    this.faces.forEach((face: string | any[], faceIdx: number) => {
      const facePointIdx = facePointStartIdx + faceIdx;
      
      for (let i = 0; i < face.length; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % face.length];
        const edge1 = [Math.min(v1, v2), Math.max(v1, v2)].toString();
        const edge1PointIdx = edgeToPoints.get(edge1);
        
        const v0 = face[(i - 1 + face.length) % face.length];
        const edge2 = [Math.min(v0, v1), Math.max(v0, v1)].toString();
        const edge2PointIdx = edgeToPoints.get(edge2);
        
        newFaces.push([v1, edge1PointIdx, facePointIdx, edge2PointIdx]);
      }
    });
    
    return new Mesh(newVertices, newFaces);
  }

  subdivideWithAveraging() {
    const subdivided = this.subdivide();
    
    if (this.isTriangular) {
      return this._loopAveraging(subdivided);
    } else {
      return this._catmullClarkAveraging(subdivided);
    }
  }

  _loopAveraging(subdivided: Mesh) {
    const smoothedVertices = [...subdivided.vertices];
    const numOrigVertices = this.vertices.length;
    
    const vertexNeighbors = new Map();
    for (const face of this.faces) {
      for (let i = 0; i < 3; i++) {
        const v = face[i];
        if (!vertexNeighbors.has(v)) {
          vertexNeighbors.set(v, new Set());
        }
        vertexNeighbors.get(v).add(face[(i + 1) % 3]);
        vertexNeighbors.get(v).add(face[(i + 2) % 3]);
      }
    }
    
    for (let i = 0; i < numOrigVertices; i++) {
      if (vertexNeighbors.has(i)) {
        const neighbors = Array.from(vertexNeighbors.get(i));
        const n = neighbors.length;
        const beta = n > 3 ? 3 / (8 * n) : 3 / 16;
        
        const newPos = [0, 0, 0];
        
        const factor = 1 - n * beta;
        for (let j = 0; j < 3; j++) {
          newPos[j] = factor * this.vertices[i][j];
        }
        
        for (const neighbor of neighbors) {
          for (let j = 0; j < 3; j++) {
            newPos[j] += beta * this.vertices[neighbor][j];
          }
        }
        
        smoothedVertices[i] = newPos;
      }
    }
    
    return new Mesh(smoothedVertices, subdivided.faces);
  }

  _catmullClarkAveraging(subdivided: Mesh) {
    const smoothedVertices = [...subdivided.vertices];
    const numOrigVertices = this.vertices.length;
    
    const vertexToFaces = new Map();
    const vertexToEdges = new Map();
    
    this.faces.forEach((face: string | any[], faceIdx: any) => {
      for (let i = 0; i < face.length; i++) {
        const v = face[i];
        if (!vertexToFaces.has(v)) {
          vertexToFaces.set(v, []);
        }
        vertexToFaces.get(v).push(faceIdx);
        
        const next = face[(i + 1) % face.length];
        const edge = [Math.min(v, next), Math.max(v, next)].toString();
        
        if (!vertexToEdges.has(v)) {
          vertexToEdges.set(v, new Set());
        }
        vertexToEdges.get(v).add(edge);
      }
    });
    
    const facePoints = this.faces.map((face: string | any[]) => {
      const avgPoint = [0, 0, 0];
      for (const vertexIdx of face) {
        const vertex = this.vertices[vertexIdx];
        avgPoint[0] += vertex[0] / face.length;
        avgPoint[1] += vertex[1] / face.length;
        avgPoint[2] += vertex[2] / face.length;
      }
      return avgPoint;
    });
    
    const edgeMidpoints = new Map();
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      for (let j = 0; j < face.length; j++) {
        const v1 = face[j];
        const v2 = face[(j + 1) % face.length];
        const edge = [Math.min(v1, v2), Math.max(v1, v2)].toString();
        
        if (!edgeMidpoints.has(edge)) {
          edgeMidpoints.set(edge, [
            (this.vertices[v1][0] + this.vertices[v2][0]) / 2,
            (this.vertices[v1][1] + this.vertices[v2][1]) / 2,
            (this.vertices[v1][2] + this.vertices[v2][2]) / 2
          ]);
        }
      }
    }
    
    for (let i = 0; i < numOrigVertices; i++) {
      if (vertexToFaces.has(i) && vertexToEdges.has(i)) {
        const faceIndices = vertexToFaces.get(i);
        const edges = vertexToEdges.get(i);
        const n = edges.size; 
        
        const F = [0, 0, 0];
        for (const faceIdx of faceIndices) {
          for (let j = 0; j < 3; j++) {
            F[j] += facePoints[faceIdx][j] / faceIndices.length;
          }
        }
        
        const R = [0, 0, 0];
        for (const edge of edges) {
          const midpoint = edgeMidpoints.get(edge);
          for (let j = 0; j < 3; j++) {
            R[j] += midpoint[j] / n;
          }
        }
        
        const newPos = [0, 0, 0];
        for (let j = 0; j < 3; j++) {
          newPos[j] = (F[j] + 2 * R[j] + (n - 3) * this.vertices[i][j]) / n;
        }
        
        smoothedVertices[i] = newPos;
      }
    }
    
    return new Mesh(smoothedVertices, subdivided.faces);
  }
}

export const createCube = () => {
  const vertices = [
    [-1, -1, -1], 
    [1, -1, -1], 
    [1, 1, -1],   
    [-1, 1, -1], 
    [-1, -1, 1], 
    [1, -1, 1], 
    [1, 1, 1],
    [-1, 1, 1] 
  ];
  
  const faces = [
    [0, 1, 2, 3], 
    [4, 5, 6, 7],
    [0, 1, 5, 4], 
    [1, 2, 6, 5], 
    [2, 3, 7, 6], 
    [3, 0, 4, 7] 
  ];
  
  return new Mesh(vertices, faces);
};

export const createTetrahedron = () => {
  const vertices = [
    [1, 1, 1],  
    [-1, -1, 1], 
    [-1, 1, -1], 
    [1, -1, -1] 
  ];
  
  const faces = [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2]
  ];
  
  return new Mesh(vertices, faces);
};

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const MeshRenderer = ({ mesh, color = 0x3498db, opacity = 0.7, wireframe = false }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    const geometry = new THREE.BufferGeometry();
    
    const vertices: any[] = [];
    mesh.vertices.forEach((vertex: any) => {
      vertices.push(...vertex);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const indices: any[] = [];
    mesh.faces.forEach((face: string | any[]) => {
      if (face.length === 3) {
        indices.push(face[0], face[1], face[2]);
      } else if (face.length === 4) {
        indices.push(face[0], face[1], face[2]);
        indices.push(face[0], face[2], face[3]);
      }
    });
    
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: opacity < 1,
      opacity: opacity,
      wireframe: wireframe,
      side: THREE.DoubleSide
    });
    
    const threeMesh = new THREE.Mesh(geometry, material);
    scene.add(threeMesh);
    
    if (!wireframe) {
      const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 });
      const wireframeGeometry = new THREE.WireframeGeometry(geometry);
      const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      scene.add(wireframeMesh);
    }
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);
    
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);
    
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
      scene.remove(threeMesh);
      geometry.dispose();
      material.dispose();
    };
  }, [mesh, color, opacity, wireframe]);
  
  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
};


import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [meshType, setMeshType] = useState('cube');
  const [subdivisionLevel, setSubdivisionLevel] = useState(0);
  const [smoothing, setSmoothing] = useState(true);
  
  const baseMesh = meshType === 'cube' ? createCube() : createTetrahedron();
  
  let displayMesh = baseMesh;
  for (let i = 0; i < subdivisionLevel; i++) {
    displayMesh = smoothing ? 
      displayMesh.subdivideWithAveraging() : 
      displayMesh.subdivide();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Mesh Subdivision Visualizer</title>
        <meta name="description" content="Interactive mesh subdivision visualizer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Mesh Subdivision Visualizer
        </h1>
        
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium">Mesh Type</label>
              <select 
              title='meshType'
                className="w-full p-2 border rounded"
                value={meshType}
                onChange={(e) => setMeshType(e.target.value)}
              >
                <option value="cube">Cube (Quadrilateral Mesh)</option>
                <option value="tetrahedron">Tetrahedron (Triangular Mesh)</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Subdivision Level</label>
              <input 
                            title='range'

                type="range" 
                min="0" 
                max="3" 
                value={subdivisionLevel}
                onChange={(e) => setSubdivisionLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center">{subdivisionLevel}</div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input 
                  type="checkbox"
                  checked={smoothing}
                  onChange={(e) => setSmoothing(e.target.checked)}
                  className="mr-2 h-5 w-5"
                />
                <span className="font-medium">Apply Smoothing</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Mesh Visualization</h2>
          <MeshRenderer 
            mesh={displayMesh} 
            color={meshType === 'cube' ? 0x3498db : 0xe74c3c}
          />
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Mesh Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-medium">Vertices</p>
              <p className="text-2xl">{displayMesh.vertices.length}</p>
            </div>
            <div>
              <p className="font-medium">Faces</p>
              <p className="text-2xl">{displayMesh.faces.length}</p>
            </div>
            <div>
              <p className="font-medium">Mesh Type</p>
              <p className="text-2xl">{displayMesh.isTriangular ? 'Triangular' : 'Quadrilateral'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}