import * as THREE from 'three';

/**
 * Vertex shader for cell rendering
 * - Passes normal vector to fragment shader
 * - Transforms vertices from model space to clip space using matrices
 */
const cellVertexShader = `
    varying vec3 vNormal;  // Output normal vector for use in fragment shader
    
    void main() {
        // Pass the normal vector to the fragment shader
        vNormal = normal;
        
        // Transform vertex from model space to clip space
        // position: vertex position in local space
        // modelViewMatrix: combined model and view matrix (object position + camera)
        // projectionMatrix: camera projection matrix
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

/**
 * Fragment shader for cell rendering
 * - Creates a semi-transparent blue color
 * - Animates opacity using sine wave based on time
 * - Supports optional playerColor for turn indicator
 */
const cellFragmentShader = `
    uniform float time;              // Time input for animation
    uniform vec3 playerColor;        // Optional player color for highlighting
    varying vec3 vNormal;            // Normal vector from vertex shader
    
    void main() {
        // Get default blue-teal color for cells
        vec3 baseColor = vec3(0.2, 0.4, 0.6);
        
        // Use playerColor if provided (non-zero), otherwise use base color
        vec3 color = length(playerColor) > 0.01 ? playerColor : baseColor;
        
        // Create pulsing opacity effect using sine wave
        // 0.3 is the base opacity, and it fluctuates by ±0.1 over time
        float alpha = 0.3 + 0.1 * sin(time);
        
        // Add subtle edge highlight based on normal vector
        float edgeHighlight = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
        color = mix(color, vec3(1.0), edgeHighlight * 0.3);
        
        // Set the final fragment color with animated transparency
        gl_FragColor = vec4(color, alpha);
    }
`;

/**
 * Creates a cell mesh with shader material at specified position
 * @param {number} x - X coordinate in 3D space
 * @param {number} y - Y coordinate in 3D space
 * @param {number} z - Z coordinate in 3D space
 * @param {number} size - Size of the cube cell (default 0.9)
 * @returns {THREE.Mesh} The cell as a Three.js mesh
 */
export function createCell(x, y, z, size = 0.9) {
    // Create a cube geometry with specified size
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Create shader material with custom time-based animation
    const material = new THREE.ShaderMaterial({
        vertexShader: cellVertexShader,     // Use the predefined vertex shader
        fragmentShader: cellFragmentShader,  // Use the predefined fragment shader
        uniforms: { 
            time: { value: 0 },             // Set initial time uniform to 0
            playerColor: { value: new THREE.Vector3(0, 0, 0) }  // Default to zero (no color override)
        },
        transparent: true,                  // Enable transparency
        depthWrite: true                    // Ensures proper depth sorting
    });
    
    // Create the mesh by combining geometry and material
    const cell = new THREE.Mesh(geometry, material);
    
    // Set the position in 3D space
    cell.position.set(x, y, z);
    
    // Set render order to 0 so cells render before particles (which have higher values)
    cell.renderOrder = 0; 
    
    return cell;
}