import * as THREE from 'three';
import { RGBELoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0; 

window.onbeforeunload = () => {
  lenis.scrollTo(0, { immediate: true });
};

if (!isTouch) gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText)

const lenis = new Lenis({
  smooth: true,
  lerp: 0.05
});


function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.1, 
  1000
);

const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setClearColor(0x01010c); 

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader()

let model = null;
new RGBELoader()
    .load('the_sky_is_on_fire_1k.hdr', function(texture){
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      // scene.background = envMap;
      scene.environment = envMap;
      texture.dispose();
      pmremGenerator.dispose()

      const loader = new GLTFLoader();
      loader.load(
        'logo-model.glb',
        function (gltf) {
          model = gltf.scene;
          model.position.set(0, 0, 0);

          model.scale.set(0.2, 0.2, 0.2);

          model.rotation.x = -Math.PI / 2;

          model.traverse((child) => {
            if (child.isMesh) {
              const glassMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0,
                transmission: 1.0, 
                thickness: 1.0,
                ior: 1.45,
                opacity: 1,  
                transparent: true,
                envMapIntensity: 1.0, 
                clearcoat: 1.0,           
                clearcoatRoughness: 0.05, 
              });

              if (Array.isArray(child.material)) {
                child.material = child.material.map(() => glassMaterial.clone());
              } else {
                child.material = glassMaterial.clone();
              }
              child.material.needsUpdate = true;
            }
          });

          scene.add(model);

          if (!isTouch) {
            gsap.to(model.scale, {
              x: 1.1,
              y: 1.1,
              z: 1.1,
              duration: 0.6,
              ease: "power2.out"
            });
          } else {
            model.scale.set(1.1, 1.1, 1.1);
          }
        },
        undefined,
        function (error) {
          console.error('An error happened while loading the model:', error);
        }
      );
    })

camera.position.z = 0.6;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

SplitText.create('nav h3', {
  type: "chars"
})

gsap.set('#split', {yPercent: 100})
gsap.to('#split',{yPercent: 0, stagger: 0.2, delay: 0.5})

let tl;
if (!isTouch) {
  tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero-text',
      start: 'top center',
      end: 'bottom top',
      scrub: true,
    }
  });

  tl.to('.brands',{x: -50})
    .to('.further',{x: 20}, "<");
}

if(!isTouch){
    gsap.set('#video-wrapper', {
    y: '-2.5rem',
    scale: 0.7,
    transformOrigin: 'top 0 left 0'
  })

    gsap.to('#video-wrapper', {
    y: '0rem',
    scale: 1,
    scrollTrigger: {
      trigger: '#video-wrapper',
      start: 'top 90%',
      end: 'top 0',
      scrub: true,
    }
  })

    const articleWrappers = document.querySelectorAll('.article-wrapper');
    articleWrappers.forEach((articleWrapper) => {
    const img = articleWrapper.parentElement.querySelector('img');
    articleWrapper.addEventListener('mouseenter', ()=>{
        gsap.to(img, {
          scale: 1.1,
          duration: 0.5,
          ease: "power2.out"
        });
    })

    articleWrapper.addEventListener('mouseout', ()=>{
    gsap.to(img, {
      scale: 1,
      duration: 0.5,
      ease: "power2.out"
    });
    })
  });
}


if (window.innerWidth < 768) {
  const socialContent = document.querySelector('#socials');
  if (socialContent) {
    socialContent.innerHTML = '';
    const socials = [
      { label: 'X' },
      { label: 'IG' },
      { label: 'LN' },
      { label: 'BR' },
      { label: 'DR' }
    ];
    socials.forEach(social => {
      const div = document.createElement('div');
      div.innerHTML = `${social.label}<i class="ri-arrow-right-up-line"></i>`;
      socialContent.appendChild(div);
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.z += 0.01;
  }
  renderer.render(scene, camera);
}
animate();

