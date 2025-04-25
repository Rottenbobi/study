<template>
  <div class="container" ref="container">
    <div class="info-panel">
      <h2>3D 模型查看器</h2>
      <p>使用鼠标拖动旋转，滚轮缩放</p>
      <div class="model-info">
        <span>当前缩放: {{ currentScaleText }}</span>
      </div>
    </div>
    <div class="controls">
      <button @click="resetView" class="control-btn">重置视图</button>
      <button @click="toggleAutoRotate" class="control-btn">{{ autoRotate ? '停止旋转' : '自动旋转' }}</button>
      <button @click="captureScreenshot" class="control-btn">截图</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, computed } from 'vue'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'

const container = ref<HTMLElement | null>(null)
const currentScale = ref(5.0)
const autoRotate = ref(false)
const currentRotation = ref({ x: -0.3, y: 0 })

// 格式化显示当前缩放值
const currentScaleText = computed(() => {
  return `${(currentScale.value * 100 / 5.0).toFixed(0)}%`
})

// 重置视图函数
function resetView() {
  if (!container.value) return
  
  // 重置旋转和缩放
  currentRotation.value.x = -0.3
  currentRotation.value.y = 0
  currentScale.value = 5.0
  
  // 更新场景中物体的缩放
  scene.traverse((object) => {
    if (object instanceof THREE.Group || object instanceof THREE.Mesh) {
      // 只针对顶层对象调整大小
      if (object.parent === scene && !(object instanceof THREE.Points) && 
          !(object instanceof THREE.GridHelper) && !(object instanceof THREE.Mesh && object.userData.isFloor)) {
        object.scale.set(currentScale.value, currentScale.value, currentScale.value)
        object.rotation.x = 0
        object.rotation.y = Math.PI
      }
    }
  })
}

// 切换自动旋转
function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
}

// 截图功能
function captureScreenshot() {
  if (!renderer) return
  
  // 渲染场景
  renderer.render(scene, camera)
  
  // 获取图像数据URL
  const dataURL = renderer.domElement.toDataURL('image/png')
  
  // 创建一个链接，用于下载
  const link = document.createElement('a')
  link.href = dataURL
  link.download = '3d-model-screenshot.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 全局变量，用于在各个函数中访问
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points

onMounted(() => {
  if (!container.value) return
  
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x3f51b5)
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 10)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.value.appendChild(renderer.domElement)
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 1024
  directionalLight.shadow.mapSize.height = 1024
  scene.add(directionalLight)
  
  // 添加聚光灯
  const spotLight = new THREE.SpotLight(0xffffff, 0.5)
  spotLight.position.set(-3, 5, 2)
  spotLight.angle = Math.PI / 6
  spotLight.penumbra = 0.3
  spotLight.castShadow = true
  scene.add(spotLight)
  
  // 添加地板
  const floorGeometry = new THREE.CircleGeometry(6, 32)
  const floorMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x3f51b5,
    emissive: 0x222266,
    shininess: 30,
    side: THREE.DoubleSide
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -3
  floor.receiveShadow = true
  floor.userData.isFloor = true
  scene.add(floor)
  
  // 添加网格Z
  const gridHelper = new THREE.GridHelper(12, 20, 0xffffff, 0x555555)
  gridHelper.position.y = -3
  scene.add(gridHelper)
  
  // 添加粒子背景（星星效果）
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 2000
  
  const posArray = new Float32Array(particlesCount * 3)
  const colorArray = new Float32Array(particlesCount * 3)
  
  for (let i = 0; i < particlesCount * 3; i++) {
    // 位置：在较大的范围内随机分布
    posArray[i] = (Math.random() - 0.5) * 50
    
    // 随机颜色：主要是白色和一些淡蓝色
    colorArray[i * 3] = 0.8 + Math.random() * 0.2 // R
    colorArray[i * 3 + 1] = 0.8 + Math.random() * 0.2 // G
    colorArray[i * 3 + 2] = 0.9 + Math.random() * 0.1 // B
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })
  
  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)
  
  // 加载模型
  const mtlLoader = new MTLLoader()
  const objLoader = new OBJLoader()
  
  // 加载材质文件
  mtlLoader.load('/src/assets/3d/ces/materials.mtl', (materials) => {
    materials.preload()
    
    // 设置材质
    objLoader.setMaterials(materials)
    
    // 加载obj模型文件
    objLoader.load('/src/assets/3d/ces/model.obj', (object) => {
      // 调整模型大小
      object.scale.set(currentScale.value, currentScale.value, currentScale.value)
      
      // 居中模型
      object.position.set(0, 0, 0)
      
      // 添加到场景
      scene.add(object)
      
      // 设置阴影
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      // 调整模型旋转角度匹配图中的视角
      object.rotation.x = 0
      object.rotation.y = Math.PI
      
      // 设置初始场景旋转，以便模型正面朝向相机
      scene.rotation.x = -0.3
    })
  })
  
  // 添加简单的控制效果
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }
  let scale = 5.0; // 保存当前缩放值
  let zoomSpeed = 0.1; // 缩放速度
  let minZoom = 1.0; // 最小缩放值
  let maxZoom = 10.0; // 最大缩放值
  
  // 鼠标事件处理
  function onMouseDown(e: MouseEvent) {
    isDragging = true
    previousMousePosition = { x: e.clientX, y: e.clientY }
  }
  
  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return
    
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    }
    
    // 更新模型旋转
    currentRotation.value.x += deltaMove.y * 0.005
    currentRotation.value.y += deltaMove.x * 0.005
    
    previousMousePosition = { x: e.clientX, y: e.clientY }
  }
  
  function onMouseUp() {
    isDragging = false
  }
  
  // 添加滚轮事件处理
  function onMouseWheel(e: WheelEvent) {
    e.preventDefault();
    
    // 确定滚动方向和缩放因子
    const delta = Math.sign(e.deltaY);
    
    // 计算新的缩放值
    scale -= delta * zoomSpeed;
    
    // 限制缩放范围
    scale = Math.max(minZoom, Math.min(maxZoom, scale));
    currentScale.value = scale;
    
    // 如果模型已加载，应用新的缩放
    scene.traverse((object) => {
      if (object instanceof THREE.Group || object instanceof THREE.Mesh) {
        // 只针对顶层对象调整大小，并排除粒子系统和地板
        if (object.parent === scene && !(object instanceof THREE.Points) && 
            !(object instanceof THREE.GridHelper) && !(object.userData && object.userData.isFloor)) {
          object.scale.set(scale, scale, scale);
        }
      }
    });
  }
  
  // 添加事件监听
  container.value.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  container.value.addEventListener('wheel', onMouseWheel, { passive: false }) // 添加滚轮事件监听
  
  // 动画函数
  function animate() {
    requestAnimationFrame(animate)
    
    // 应用旋转
    scene.rotation.x = currentRotation.value.x
    scene.rotation.y = currentRotation.value.y
    
    // 自动旋转
    if (autoRotate.value) {
      scene.rotation.y += 0.005
      currentRotation.value.y += 0.005 // 更新旋转值以保持同步
    }
    
    // 使粒子轻微转动，增加动态效果
    if (particles) {
      particles.rotation.y += 0.0003
      particles.rotation.x += 0.0001
    }
    
    renderer.render(scene, camera)
  }
  
  // 开始动画
  animate()
  
  // 窗口大小改变事件
  function handleResize() {
    if (!container.value) return
    
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  
  window.addEventListener('resize', handleResize)
  
  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    
    if (container.value) {
      container.value.removeEventListener('mousedown', onMouseDown)
      container.value.removeEventListener('wheel', onMouseWheel) // 移除滚轮事件监听
      container.value.innerHTML = ''
    }
    
    // 清理场景
    scene.clear()
    renderer.dispose()
  })
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #3f51b5;
  font-family: 'Arial', sans-serif;
  position: relative;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  z-index: 10;
  max-width: 250px;
}

.info-panel h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
}

.info-panel p {
  margin: 0 0 15px 0;
  opacity: 0.9;
}

.model-info {
  margin-top: 10px;
  font-size: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.control-btn {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
