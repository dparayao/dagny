import { useState, useRef, useEffect, useMemo } from 'react';
import AsciiModel from './components/AsciiModel';
import TypingEffect from './components/TypingEffect';
import './App.css';

function App() {
  // Control which animation plays
  const [currentAnimation, setCurrentAnimation] = useState('pm0197_00_00_00010_defaultidle01.001');
  const [cameraView, setCameraView] = useState(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedProjectSubTab, setSelectedProjectSubTab] = useState(0);
  const [selectedLinksSubTab, setSelectedLinksSubTab] = useState(0);
  const animationQueueRef = useRef([]);

  // Combined animation + camera presets (using offsets from original position)
  // useMemo prevents recreation on every render
  const animationPresets = useMemo(() => ({
    idle: {
      animation: 'pm0197_00_00_00010_defaultidle01.001',
      camera: {
        positionOffset: [0, 0, 0],
        targetOffset: [0, 0, 0]
      }
    },
    walk: {
      animation: 'pm0197_00_00_00001_battlewait01_loop',
      camera: {
        positionOffset: [-5, 0,  0],  // Move right and forward for side view
        targetOffset: [0, 0, -.3]
      }
    },
    run: {
      animation: 'pm0197_00_00_00550_glad01',
      camera: {
        positionOffset: [0, -.3, 1.2],  // Move up and forward for top-down view
        targetOffset: [0, 0, 0]
      }
    },
    combo: {
      camera: {
        positionOffset: [-3, 2, 2],  // Elevated 3/4 view
        targetOffset: [0, 1, 0]
      }
    }
  }), []);

  // Tab configuration
  const tabs = useMemo(() => [
    { key: 'idle', label: 'about me' },
    { key: 'walk', label: 'projects' },
    { key: 'run', label: 'links' },
  ], []);

  // Sub-tabs for projects
  // Each sub-tab has camera offsets that are ADDED to the main projects tab camera
  const projectSubTabs = useMemo(() => [
    {
      key: 'sound-play',
      label: 'sound & play',
      animation: 'pm0197_00_00_00001_battlewait01_loop',
      cameraOffset: {
        positionOffset: [0, 0, 0],  // No additional offset from projects camera
        targetOffset: [0, 0, 0]
      }
    },
    {
      key: 'tools',
      label: 'tools for creators',
      animation: 'pm0197_00_00_00011_defaultidle02',
      cameraOffset: {
        positionOffset: [0.5, 0, 0],  // Different angle
        targetOffset: [0, 0, 0]
      }
    },
    {
      key: 'data',
      label: 'data stories',
      animation: 'pm0197_00_00_00320_refresh01',
      cameraOffset: {
        positionOffset: [6, 0, 0],  // Another variation
        targetOffset: [0, 0, 0]
      }
    },
    {
      key: 'systems',
      label: 'systems that scale',
      animation: 'pm0197_00_00_00320_refresh01',
      cameraOffset: {
        // positionOffset changes on an orbit relative to model
        positionOffset: [4.5, .25, 0],  // Slight variation from projects camera
        targetOffset: [0, 0, -.7]
      }
    }
  ], []);

  // Sub-tabs for links
  const linksSubTabs = useMemo(() => [
    { key: 'linkedin', label: 'linkedin', url: 'https://www.linkedin.com/in/dagnyparayao/' },
    { key: 'github', label: 'github', url: 'https://github.com/dparayao' },
    { key: 'websites', label: 'my favorite websites', url: 'https://www.are.na/dagny-parayao/my-fave-websites-fyyl1dhgohg' }
  ], []);

  // Sentences for typing effect
  const currentlySentences = useMemo(() => [
    'reading beware of pity by stefan zweig',
    'stalking r/opensource',
    'putting ascii characters in my instagram posts',
    'playing tft',
    'listening to the how deep is your love cover by mitski'
  ], []);

  // Content for right textbox based on selected tab
  const getTabContent = () => {
    switch (selectedTabIndex) {
      case 0:
        return (
          <div className="idle-content">
            <p className="bio">
              hi i'm dagny! ucla cs'25 software engineer. i enjoy building playful, dynamic websites
              inspired by my favorite media and working in full stack/system
              design, where i can get lost in complex software problems. as a community
              organizer in undergrad, i am passionate about accessibility on and offline.
            </p>
            <TypingEffect sentences={currentlySentences} />
          </div>
        );
      case 1:
        // Projects content based on selected sub-tab
        return getProjectContent();
      case 2:
        return ''; // Links don't show content, just sub-tabs with links
      default:
        return '';
    }
  };

  // Get project content based on selected sub-tab
  const getProjectContent = () => {
    switch (selectedProjectSubTab) {
      case 0:
        return (
          <section className="project-category">
            <h2>Sound & Play</h2>

            <article className="project">
              <h3>Interactive Music Timeline</h3>
              <p className="description">Built for digital humanities course assignment to make website for our essays. I added an interactive timeline with custom animations and embedded playback.</p>
              <p className="tech-stack">Canvas API · YouTube API · React</p>
              <a href="https://angel-visualizer-4urt.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-link">View Project →</a>
            </article>

            <article className="project">
              <h3>iOS Guitar Pedal App</h3>
              <p className="description">Real-time audio effects for guitar—fuzz, chorus, delay, reverb, built to help me learn guitar and computational music on a foundational level. inspired by wisp's sound.</p>
              <p className="tech-stack">Swift · SwiftUI · AudioKit</p>
              <p className="status">In progress</p>
            </article>

            <article className="project">
              <h3>Interactive 3D Animation</h3>
              <p className="description">My role was to implement mouse picking and custom textures. Physics-based team animation for Computer Graphics I.</p>
              <p className="tech-stack">WebGL · JavaScript</p>
              <a href="https://drive.google.com/file/d/1qmClHmU3oVWrj-2sGH8smaMejSveYE-s/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="project-link">View Demo Video →</a>
            </article>

            <article className="project">
              <h3>Three.js Game Demo</h3>
              <p className="description">Story-driven game prototype with a custom Blender model, physics-based movement, and interactive dialogue. Team animation for Computer Graphics II. Main writer and designer for game story/aesthetics.</p>
              <p className="tech-stack">Three.js · React · Blender</p>
              <a href="https://www.canva.com/design/DAGiCXjRyzU/YI7WNnJLPpuwYzSj4W9Qtw/view?utm_content=DAGiCXjRyzU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hd4574278b8" target="_blank" rel="noopener noreferrer" className="project-link">View Demo Presentation →</a>
            </article>

            <article className="project">
              <h3>this website!</h3>
              <p className="description">Interactive umbreon model with three.js ASCII filter. Used open-source python script to convert Umbreon game model to .gltf.</p>
              <p className="tech-stack">React · three.js</p>
              <a href="https://www.are.na/dagny-parayao/insp-m82rhngw2ww" target="_blank" rel="noopener noreferrer" className="project-link">My Inspo →</a>
            </article>

          </section>
        );
      case 1:
        return (
          <section className="project-category">
            <h2>For Creators</h2>

            <article className="project">
              <div className="project-header">
                <h3>Excalidraw Search Plugin</h3>
                <span className="award">★ 2nd Place, UCLA HCI Showcase</span>
              </div>
              <p className="description">Reimagining an artist's search history as their inspiration board. Implemented search for Pinterest, Google, etc. within the Excalidraw canvas, integrated with Gemini for suggested searches from uploaded photos. Created foundational work for teammates to use large open source codebase.</p>
              <p className="tech-stack">React · Google APIs · Gemini API · Excalidraw Codebase</p>
              <a href="https://preview--rabbit-hole-artist-guide.lovable.app/" target="_blank" rel="noopener noreferrer" className="project-link">View Project →</a>
            </article>

            <article className="project">
              <h3>Film Festival Website</h3>
              <p className="description">Themed around Muybridge's <em>The Horse in Motion</em>. Built in 3 weeks. For UCLA Film Festival with worldwide submissions and celebrity judges.</p>
              <p className="tech-stack">React</p>
              <a href="https://drive.google.com/file/d/1Qoj_BA1do6geniIT2gdnSg_JNwphpCAx/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="project-link">View Project →</a>
            </article>

            <article className="project">
              <h3>Bruin Bash 2023</h3>
              <p className="description">UCLA's biggest welcome event—10,000+ students, $175k budget. Led the web team while coordinating with design, marketing, and sponsors like Postmates/Discord.</p>
              <p className="tech-stack">React · Figma · DigitalOcean· Docker</p>
              <a href="https://drive.google.com/file/d/14RJfyO_5dgMMtkVz5FkVOSic9tSwVL0h/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="project-link">View Project →</a>
            </article>

            <article className="project">
              <h3>Bruin Bash 2022</h3>
              <p className="description">My first time directing a team, working with React and a monorepo. Built the site in 3 weeks, learned to translate a design handoff into a live product under a hard deadline.</p>
              <p className="tech-stack">React · DigitalOcean· Docker</p>
            </article>

            <article className="project">
              <h3>Real-time Photo Gallery Backend</h3>
              <p className="description">Backend for UCLA CEC's gallery site, with headless CMS. Handles 20+ concurrent uploads with automatic resizing and real-time sync.</p>
              <p className="tech-stack">KeystoneJS · GraphQL · PostgreSQL · Docker · DigitalOcean</p>
            </article>

          </section>
        );
      case 2:
        return (
          <section className="project-category">
            <h2>Data Stories</h2>

            <article className="project">
              <h3>Asian Internet Slang Trend Analysis</h3>
              <p className="description">Processed 1.87M social media comments across Reddit, Twitter, and TikTok to track how Asian-American slang evolved over 18 years.</p>
              <p className="tech-stack">Python · NLTK · pandas · React</p>
              <a href="https://dparayao.github.io/asian-internet/" target="_blank" rel="noopener noreferrer" className="project-link">View Project →</a>
            </article>

            <article className="project">
              <h3>Forest Covertype Prediction</h3>
              <p className="description">Compared different models' ability to determine which features accurately predicted forest covertype. </p>
              <p className="tech-stack">Python</p>
              <a href="https://archive.ics.uci.edu/dataset/31/covertype" target="_blank" rel="noopener noreferrer" className="project-link">Dataset used →</a>
            </article>

            <article className="project">
              <h3>Artist Diversity Visualizations</h3>
              <p className="description">Data visualizations analyzing artist representation across 18 major U.S. museums.</p>
              <p className="tech-stack">Tableau · WordPress</p>
            </article>
          </section>
        );
      case 3:
        return (
          <section className="project-category">
            <h2>Systems That Scale</h2>

            <article className="project">
              <h3>Distributed Chatroom Server</h3>
              <p className="description">Multi-threaded C++ server with WebSocket connections, SSL/TLS encryption, and room-based subscriptions. Deployed and hosted on Google Cloud Code. Led a 4-person team; we hit 90%+ test coverage.</p>
              <p className="tech-stack">C++ · Boost.Asio · OpenSSL · Google Cloud · Google Test</p>
            </article>

            <article className="project">
              <h3>Software Engineer <span className="current-badge">Current</span></h3>
              <p className="description">Sole maintainer of a C++ network information broker at NG. Built Python test automation tool for team's largest information broker security code. Weekly releases to external stakeholders.</p>
              <p className="tech-stack">C++ · Python · Jenkins· Linux</p>
            </article>
          </section>
        );
      default:
        return '';
    }
  };

  // Styling for right textbox based on selected tab
  const getContentBoxStyle = () => {
    switch (selectedTabIndex) {
      case 0:
        return {
          top: '10rem',
          height: 'auto',
          width: '35rem',
          maxWidth: '50rem'
        };
      case 1:
        return {
          top: '10%',
          height: '80vh',
          transform: 'translateY(0)',
          overflowY: 'auto',
          width: '30rem',
          maxWidth: '30rem'
        };
      case 2:
        return {
          display: 'none', // Links don't show content box
        };
      default:
        return {
          top: '50%',
          height: 'auto',
        };
    }
  };

  // Handle animation completion for chaining
  const handleAnimationComplete = (completedAnimation) => {
    console.log('Animation completed:', completedAnimation);

    // Play next animation in queue
    if (animationQueueRef.current.length > 0) {
      const nextAnimation = animationQueueRef.current.shift();
      setCurrentAnimation(nextAnimation);
    }
  };

  // Handle tab selection with cyclical behavior
  const handleTabClick = (clickedIndex) => {
    setSelectedTabIndex(clickedIndex);

    // Reset sub-tabs when changing main tabs
    if (clickedIndex === 1) {
      setSelectedProjectSubTab(0);
    } else if (clickedIndex === 2) {
      setSelectedLinksSubTab(0);
    }

    const tab = tabs[clickedIndex];
    const preset = animationPresets[tab.key];

    // Handle combo animation differently (chained sequence)
    if (tab.key === 'combo') {
      // Set camera for combo view
      setCameraView(preset.camera);

      // Queue up a sequence of animations
      animationQueueRef.current = [
        'pm0197_00_00_10300_roar01',           // Roar
        'pm0197_00_00_10400_attack01.001',     // Attack
        'pm0197_00_00_00011_defaultidle02'     // Back to idle
      ];

      // Start the sequence
      const firstAnimation = animationQueueRef.current.shift();
      setCurrentAnimation(firstAnimation);
    } else {
      // Create new camera object to ensure React sees it as changed
      setCameraView({
        positionOffset: [...preset.camera.positionOffset],
        targetOffset: [...preset.camera.targetOffset]
      });

      // Set animation
      if (preset.animation) {
        setCurrentAnimation(preset.animation);
      }
    }

    // If projects tab, play first sub-tab animation
    if (clickedIndex === 1 && projectSubTabs[0].animation) {
      setCurrentAnimation(projectSubTabs[0].animation);
    }
  };

  // Handle project sub-tab click
  const handleProjectSubTabClick = (subIndex) => {
    setSelectedProjectSubTab(subIndex);
    const subTab = projectSubTabs[subIndex];

    // Combine the main projects camera with this sub-tab's offset
    const baseCamera = animationPresets.walk.camera;
    const subTabCamera = {
      positionOffset: [
        baseCamera.positionOffset[0] + subTab.cameraOffset.positionOffset[0],
        baseCamera.positionOffset[1] + subTab.cameraOffset.positionOffset[1],
        baseCamera.positionOffset[2] + subTab.cameraOffset.positionOffset[2]
      ],
      targetOffset: [
        baseCamera.targetOffset[0] + subTab.cameraOffset.targetOffset[0],
        baseCamera.targetOffset[1] + subTab.cameraOffset.targetOffset[1],
        baseCamera.targetOffset[2] + subTab.cameraOffset.targetOffset[2]
      ]
    };

    setCameraView(subTabCamera);

    if (subTab.animation) {
      setCurrentAnimation(subTab.animation);
    }
  };

  // Handle links sub-tab click
  const handleLinksSubTabClick = (subIndex) => {
    setSelectedLinksSubTab(subIndex);
    // Links don't trigger animations, just open URLs
    const subTab = linksSubTabs[subIndex];
    if (subTab.url) {
      window.open(subTab.url, '_blank');
    }
  };

  // Set initial camera view on mount
  useEffect(() => {
    // Set the idle camera view on initial load
    const idlePreset = animationPresets.idle;
    if (idlePreset.camera) {
      setCameraView(idlePreset.camera);
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="app">
      {/* Full-screen ASCII model */}
      <div className="model-container">
        <AsciiModel
          modelPath="/model.glb"
          currentAnimation={currentAnimation}
          onAnimationComplete={handleAnimationComplete}
          cameraView={cameraView}
          options={{
            characters: ' .:-=+*#%@',
            invert: true,
            resolution: 0.3,      // Lower = more detail (try 0.1 - 0.2)
            color: '#bad8e7ff',
            backgroundColor: '#1c1d1eff',
            scale: 1.23,              // Adjust based on your model
            position: [0, 0, 0],
            autoRotate: false,
            enableControls: true,  // Orbit controls (drag to rotate)
          }}
        />
      </div>

      {/* DDR-style tab selector */}
      <div className="tab-container">
        {/* White box underneath text that moves */}
        <div
          className="tab-highlight"
          style={{ transform: `translateY(${selectedTabIndex * 50}px)` }}
        />

        {/* Static lines */}
        {tabs.map((tab, index) => (
          <div
            key={tab.key}
            className={`tab-line ${selectedTabIndex === index ? 'tab-line-selected' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <div className="tab-label">{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Projects sub-tabs */}
      {selectedTabIndex === 1 && (
        <div className="sub-tab-container">
          <div
            className="sub-tab-highlight"
            style={{ transform: `translateY(${selectedProjectSubTab * 40}px)` }}
          />
          {projectSubTabs.map((subTab, index) => (
            <div
              key={subTab.key}
              className={`sub-tab-line ${selectedProjectSubTab === index ? 'sub-tab-line-selected' : ''}`}
              onClick={() => handleProjectSubTabClick(index)}
            >
              <div className="sub-tab-label">{subTab.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Links sub-tabs */}
      {selectedTabIndex === 2 && (
        <div className="links-sub-tab-container">
          {linksSubTabs.map((subTab, index) => (
            <a
              key={subTab.key}
              href={subTab.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`links-sub-tab ${selectedLinksSubTab === index ? 'links-sub-tab-selected' : ''}`}
              onClick={(e) => {
                if (!subTab.url) e.preventDefault();
                handleLinksSubTabClick(index);
              }}
            >
              {subTab.label}
            </a>
          ))}
        </div>
      )}

      {/* Title overlay */}
      <div className="title-overlay">
        <h1>dagny eloise parayao</h1>
      </div>

      {/* Right content textbox */}
      <div className="content-box" style={getContentBoxStyle()}>
        {getTabContent()}
      </div>
    </div>
  );
}

export default App;
