/**
 * Local & Private Resume Matcher Engine for Game Development Roles.
 *
 * All parsing, keyword extraction, and score calculations run 100% locally inside the browser.
 */

import type { JobListing } from './jobs';

export interface HighImpactKeyword {
  keyword: string;
  category: string;
  impactScore: number;
  tip: string;
  exampleBullet: string;
}

export interface ImprovementPlan {
  headlineSuggestion: string;
  skillsSectionSuggestion: string[];
  experienceBulletExamples: string[];
  keyActionItems: string[];
}

export interface ResumeMatchResult {
  score: number; // 0 - 100
  potentialScore: number; // Projected score if recommendations applied (e.g. 95)
  rating: 'Exceptional Match' | 'Strong Match' | 'Good Match' | 'Moderate Fit' | 'Low Match';
  ratingColor: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  highImpactKeywords: HighImpactKeyword[];
  categoryBreakdown: {
    category: string;
    matched: string[];
    missing: string[];
    score: number;
  }[];
  improvementPlan: ImprovementPlan;
  tailoringTips: string[];
}

// ─── Game Development Skills & Keywords Taxonomy ─────────────────────────────
interface SkillDefinition {
  name: string;
  category: 'Engines & Tools' | 'Programming & Tech' | 'Art & Animation' | 'Game Design' | 'Audio' | 'Production & QA' | 'Platforms & Hardware';
  synonyms: string[];
  exampleBullet?: string;
  tip?: string;
}

const GAME_SKILLS_DATABASE: SkillDefinition[] = [
  // ── Engines & Tools
  {
    name: 'Unreal Engine',
    category: 'Engines & Tools',
    synonyms: ['unreal engine', 'unreal', 'ue4', 'ue5', 'unreal engine 5', 'unreal engine 4'],
    tip: 'Mention specific UE5 systems like Blueprints, Gameplay Ability System (GAS), or Nanite/Lumen.',
    exampleBullet: 'Architected gameplay mechanics and combat abilities in Unreal Engine 5 using C++ and Gameplay Ability System (GAS).',
  },
  {
    name: 'Unity',
    category: 'Engines & Tools',
    synonyms: ['unity', 'unity3d', 'unity 2022', 'unity 6', 'unity engine'],
    tip: 'Mention C# scripting, ScriptableObjects, Addressables, or the Universal Render Pipeline (URP).',
    exampleBullet: 'Engineered modular gameplay systems in Unity (C#) utilizing ScriptableObjects, Addressables, and URP shader graphs.',
  },
  {
    name: 'Godot',
    category: 'Engines & Tools',
    synonyms: ['godot', 'godot engine', 'gdscript'],
    tip: 'Mention GDScript or C# integration and node-based scene architecture.',
    exampleBullet: 'Built high-performance 2D/3D gameplay prototypes in Godot 4 using GDScript and custom shader nodes.',
  },
  {
    name: 'Blender',
    category: 'Engines & Tools',
    synonyms: ['blender', 'blender 3d'],
    tip: 'Mention hard-surface modeling, UV unwrapping, or geometry nodes.',
    exampleBullet: 'Modeled, textured, and rigged game-ready 3D assets in Blender with optimized topology and clean UV layouts.',
  },
  {
    name: 'Maya',
    category: 'Engines & Tools',
    synonyms: ['autodesk maya', 'maya'],
    tip: 'Mention character rigging, animation curves, or Python scripting for art pipelines.',
    exampleBullet: 'Created animation-ready character rigs and skeletal hierarchies in Autodesk Maya for in-engine deployment.',
  },
  {
    name: '3ds Max',
    category: 'Engines & Tools',
    synonyms: ['3ds max', '3dsmax'],
    tip: 'Mention environment asset creation and modular kitbashing.',
    exampleBullet: 'Constructed modular 3D environment kits and hard-surface props in 3ds Max meeting strict polygon budgets.',
  },
  {
    name: 'ZBrush',
    category: 'Engines & Tools',
    synonyms: ['zbrush', 'pixologic zbrush'],
    tip: 'Mention high-resolution digital sculpting and baking normal maps for low-poly game models.',
    exampleBullet: 'Sculpted high-detail organic characters and creatures in ZBrush, baking normal and ambient occlusion maps.',
  },
  {
    name: 'Substance Painter',
    category: 'Engines & Tools',
    synonyms: ['substance painter', 'substance 3d', 'substance designer'],
    tip: 'Mention PBR (Physically Based Rendering) texturing workflows and smart materials.',
    exampleBullet: 'Authored realistic PBR texture sets in Substance 3D Painter adhering to studio art direction and lighting standards.',
  },
  {
    name: 'Photoshop',
    category: 'Engines & Tools',
    synonyms: ['photoshop', 'adobe photoshop'],
    tip: 'Mention concept sketching, UI assets, and texture map painting.',
    exampleBullet: 'Designed UI elements, sprite sheets, and concept color keys in Adobe Photoshop for real-time integration.',
  },
  {
    name: 'Spine',
    category: 'Engines & Tools',
    synonyms: ['spine 2d', 'esoteric spine', 'spine animation'],
    tip: 'Mention skeletal 2D animations, inverse kinematics (IK), and skinning.',
    exampleBullet: 'Animated expressive 2D characters in Spine 2D using skeletal rigs, weights, and mesh deformation.',
  },
  {
    name: 'Houdini',
    category: 'Engines & Tools',
    synonyms: ['sidefx houdini', 'houdini'],
    tip: 'Mention procedural generation, terrain pipelines, or destruction VFX.',
    exampleBullet: 'Built procedural level generation tools and dynamic destruction simulations in SideFX Houdini for engine export.',
  },
  {
    name: 'Wwise',
    category: 'Engines & Tools',
    synonyms: ['audiokinetic wwise', 'wwise'],
    tip: 'Mention sound banks, dynamic mixing, RTPC parameters, and spatial audio.',
    exampleBullet: 'Integrated interactive sound design into the game engine via Audiokinetic Wwise using RTPCs and state-driven events.',
  },
  {
    name: 'FMOD',
    category: 'Engines & Tools',
    synonyms: ['fmod studio', 'fmod'],
    tip: 'Mention multi-track event design and parameter modulation for adaptive music.',
    exampleBullet: 'Designed adaptive musical scores and interactive audio events in FMOD Studio, hooking parameters directly to gameplay triggers.',
  },
  {
    name: 'Perforce',
    category: 'Engines & Tools',
    synonyms: ['perforce', 'helix core', 'p4', 'p4v'],
    tip: 'Demonstrates familiarity with AAA version control and binary asset locking.',
    exampleBullet: 'Managed daily builds, binary asset check-ins, and stream branching strategies using Perforce (Helix Core / P4V).',
  },
  {
    name: 'Git',
    category: 'Engines & Tools',
    synonyms: ['git', 'github', 'gitlab', 'version control'],
    tip: 'Mention Git LFS, branching models, and pull request code reviews.',
    exampleBullet: 'Maintained repository health with Git / Git LFS, conducting peer code reviews and automated CI/CD validation.',
  },
  {
    name: 'Jira',
    category: 'Engines & Tools',
    synonyms: ['jira', 'atlassian jira'],
    tip: 'Mention sprint tracking, bug lifecycle management, and story estimation.',
    exampleBullet: 'Tracked feature deliverables and resolved blocker bugs in Atlassian Jira within 2-week Agile sprint cycles.',
  },
  {
    name: 'Roblox Studio',
    category: 'Engines & Tools',
    synonyms: ['roblox studio', 'roblox engine', 'luau'],
    tip: 'Mention Luau scripting, data stores, physics, and networking.',
    exampleBullet: 'Scripted scalable multiplayer game mechanics and monetization systems in Roblox Studio utilizing Luau and DataStores.',
  },

  // ── Programming & Tech
  {
    name: 'C++',
    category: 'Programming & Tech',
    synonyms: ['c++', 'modern c++', 'cpp', 'c++20', 'c++17'],
    tip: 'Highlight memory management, pointers, multithreading, and cache-friendly data structures.',
    exampleBullet: 'Authored performance-critical engine and gameplay subsystems in Modern C++ (C++17/20), optimizing memory and cache locality.',
  },
  {
    name: 'C#',
    category: 'Programming & Tech',
    synonyms: ['c#', 'csharp', '.net'],
    tip: 'Highlight asynchronous programming, LINQ avoidance for GC optimization, and object pooling.',
    exampleBullet: 'Developed zero-allocation gameplay systems in C#, utilizing object pooling and optimized data structures to eliminate GC hitches.',
  },
  {
    name: 'Python',
    category: 'Programming & Tech',
    synonyms: ['python', 'python 3', 'py'],
    tip: 'Highlight tool development, build pipelines, or DCC automation scripts.',
    exampleBullet: 'Wrote automated Python tool pipelines for DCC software, reducing asset import turnaround times by 40%.',
  },
  {
    name: 'Rust',
    category: 'Programming & Tech',
    synonyms: ['rust', 'rust-lang'],
    tip: 'Mention memory safety, ECS (Entity Component System) architectures, or backend servers.',
    exampleBullet: 'Built high-throughput backend game servers and custom tooling in Rust with zero-cost abstractions.',
  },
  {
    name: 'Lua',
    category: 'Programming & Tech',
    synonyms: ['lua', 'luau'],
    tip: 'Mention gameplay scripting and rapid quest/mechanic iteration.',
    exampleBullet: 'Exposed core C++ systems to Lua scripting to empower narrative designers to build complex quest states without re-compiles.',
  },
  {
    name: 'Shaders (HLSL/GLSL)',
    category: 'Programming & Tech',
    synonyms: ['shader', 'shaders', 'hlsl', 'glsl', 'shaderlab', 'shader graph'],
    tip: 'Mention vertex/fragment shaders, compute shaders, post-processing, or procedural materials.',
    exampleBullet: 'Authored custom HLSL/GLSL pixel and compute shaders for stylized water reflections, dynamic weather, and screen-space VFX.',
  },
  {
    name: 'Graphics & Rendering',
    category: 'Programming & Tech',
    synonyms: ['rendering', 'graphics pipeline', 'directx', 'vulkan', 'opengl', 'metal', 'ray tracing'],
    tip: 'Mention rendering pipelines, draw call batching, LOD management, and GPU profiling.',
    exampleBullet: 'Optimized the real-time graphics pipeline using DirectX/Vulkan, reducing draw calls and vertex overhead on low-end hardware.',
  },
  {
    name: 'Gameplay Programming',
    category: 'Programming & Tech',
    synonyms: ['gameplay programming', 'gameplay engineer', 'gameplay systems', 'game mechanics'],
    tip: 'Mention player controls, weapon handling, camera feel, and interactive game loops.',
    exampleBullet: 'Programmed responsive character movement, 3Cs (Character, Camera, Controls), and combat abilities in real-time.',
  },
  {
    name: 'Multiplayer & Netcode',
    category: 'Programming & Tech',
    synonyms: ['multiplayer', 'netcode', 'networking', 'replication', 'client-server', 'photon', 'nakama', 'mirror', 'dedicated servers'],
    tip: 'Mention client-side prediction, server reconciliation, lag compensation, and state replication.',
    exampleBullet: 'Implemented client-side prediction and server reconciliation for fast-paced multiplayer combat over dedicated servers.',
  },
  {
    name: 'AI & Behavior Trees',
    category: 'Programming & Tech',
    synonyms: ['game ai', 'artificial intelligence', 'behavior trees', 'navmesh', 'pathfinding', 'state machines', 'fsm'],
    tip: 'Mention navigation mesh pathfinding, finite state machines (FSM), and enemy decision making.',
    exampleBullet: 'Engineered enemy AI using Behavior Trees, EQS (Environment Query System), and NavMesh pathfinding for dynamic squad combat.',
  },
  {
    name: 'Physics & Simulation',
    category: 'Programming & Tech',
    synonyms: ['physx', 'havok', 'rigid body', 'game physics', 'ragdoll', 'cloth simulation'],
    tip: 'Mention collision detection, raycasting, vehicle handling, or ragdoll physics.',
    exampleBullet: 'Configured PhysX/Havok collision layers, dynamic ragdoll blend weights, and raycast projectile trajectories.',
  },
  {
    name: 'Optimization & Profiling',
    category: 'Programming & Tech',
    synonyms: ['optimization', 'profiling', 'performance tuning', 'memory management', 'draw calls', 'frame rate optimization'],
    tip: 'Mention RenderDoc, Unreal Insights, CPU/GPU profiling, and eliminating frame drops.',
    exampleBullet: 'Profiled bottlenecks using Unreal Insights / RenderDoc, optimizing CPU render threads to hit steady 60 FPS on target hardware.',
  },

  // ── Art & Animation
  {
    name: '3D Modeling',
    category: 'Art & Animation',
    synonyms: ['3d modeling', 'low poly', 'high poly', 'hard surface', 'sculpting', 'retopology'],
    tip: 'Mention topology cleanliness, edge flow, and baking details to low-poly meshes.',
    exampleBullet: 'Created clean, game-ready 3D models with optimized polygon budgets, proper edge loops, and LOD variations.',
  },
  {
    name: '2D Art & Concept Art',
    category: 'Art & Animation',
    synonyms: ['concept art', '2d art', 'illustration', 'digital painting', 'character concept', 'environment concept'],
    tip: 'Mention visual exploration, thumbnails, turnaround sheets, and mood boards.',
    exampleBullet: 'Produced character and environment concept art turnarounds with callout sheets guiding 3D modelers and texture artists.',
  },
  {
    name: 'Character Art',
    category: 'Art & Animation',
    synonyms: ['character artist', 'character modeling', 'anatomy', 'character design'],
    tip: 'Mention anatomy mastery, costume detailing, and material definition.',
    exampleBullet: 'Sculpted anatomically accurate hero characters with detailed clothing layers and realistic hair card cards.',
  },
  {
    name: 'Environment Art',
    category: 'Art & Animation',
    synonyms: ['environment artist', 'level art', 'foliage', 'world building', 'set dressing', 'modular environment'],
    tip: 'Mention modular architectural kits, trim sheets, and set dressing.',
    exampleBullet: 'Designed and dressed modular sci-fi environments utilizing trim sheets, tileable textures, and decals for visual variety.',
  },
  {
    name: 'Animation & Rigging',
    category: 'Art & Animation',
    synonyms: ['rigging', 'skinning', 'character animation', 'keyframe animation', 'mocap', 'motion capture'],
    tip: 'Mention root motion, blend trees, animation state machines, and weight painting.',
    exampleBullet: 'Keyframed snappy combat animations and built IK rigs with blend trees and state transitions in-engine.',
  },
  {
    name: 'VFX & Particles',
    category: 'Art & Animation',
    synonyms: ['vfx', 'visual effects', 'niagara', 'shuriken', 'particle systems', 'real-time vfx'],
    tip: 'Mention particle emitters, sprite flipbooks, mesh particles, and screen distortions.',
    exampleBullet: 'Authored spell casting and explosion VFX in Unreal Niagara and Unity Shuriken with custom texture atlases.',
  },
  {
    name: 'Technical Art',
    category: 'Art & Animation',
    synonyms: ['technical artist', 'tech art', 'art pipeline', 'python scripting for maya', 'rigging pipeline'],
    tip: 'Mention bridging art and engineering, custom shaders, and pipeline tools.',
    exampleBullet: 'Bridged creative art and engineering teams by building automated Maya export scripts and custom shader master materials.',
  },
  {
    name: 'UI / UX Design',
    category: 'Art & Animation',
    synonyms: ['ui/ux', 'user interface', 'user experience', 'hud design', 'wireframing', 'figma'],
    tip: 'Mention HUD layout, responsive design, wireframes in Figma, and player accessibility.',
    exampleBullet: 'Designed intuitive in-game HUDs, inventory menus, and visual feedback states in Figma, integrating with UMG / UI Toolkit.',
  },

  // ── Game Design
  {
    name: 'Game Design',
    category: 'Game Design',
    synonyms: ['game design', 'game designer', 'core loop', 'mechanics design', 'gdd', 'game design document'],
    tip: 'Mention core gameplay loops, mechanic documentation, player motivation, and feature specs.',
    exampleBullet: 'Authored comprehensive Game Design Documents (GDD) and designed core progression loops with rapid paper prototyping.',
  },
  {
    name: 'Level Design',
    category: 'Game Design',
    synonyms: ['level design', 'level designer', 'grayboxing', 'blockout', 'pacing', 'encounter design'],
    tip: 'Mention player flow, sightlines, combat encounters, and whiteboxing.',
    exampleBullet: 'Grayboxed and playtested full mission levels in-engine, pacing combat encounters and leading player eye-lines with lighting.',
  },
  {
    name: 'Combat & Systems Design',
    category: 'Game Design',
    synonyms: ['combat design', 'systems design', 'character progression', 'itemization', 'economy design', 'game balance'],
    tip: 'Mention mathematical balance models, damage curves, skill trees, and spreadsheet modeling.',
    exampleBullet: 'Balanced weapon stats, armor formulas, and player economy progression using mathematical models in Excel/Google Sheets.',
  },
  {
    name: 'Narrative Design',
    category: 'Game Design',
    synonyms: ['narrative design', 'quest design', 'branching dialogue', 'storytelling', 'lore writing', 'worldbuilding'],
    tip: 'Mention Twine, branching dialogue trees, quest states, and world lore.',
    exampleBullet: 'Wrote interactive questlines with multi-path branching dialogue trees in Twine, linking quest flags directly to gameplay events.',
  },

  // ── Audio
  {
    name: 'Sound Design',
    category: 'Audio',
    synonyms: ['sound design', 'sound designer', 'sfx', 'foley', 'audio mixing', 'audio mastering'],
    tip: 'Mention recording foley, layering synths, and spatial mixing.',
    exampleBullet: 'Recorded and designed custom sound effects (SFX) for weapons, UI, and monster vocals with high dynamic range.',
  },
  {
    name: 'Music Composition',
    category: 'Audio',
    synonyms: ['music composition', 'composer', 'adaptive audio', 'interactive music'],
    tip: 'Mention vertical layering, horizontal re-sequencing, and dynamic transitions.',
    exampleBullet: 'Composed thematic adaptive soundtracks with vertical stems that dynamically escalate during high-intensity combat.',
  },
  {
    name: 'Audio Implementation',
    category: 'Audio',
    synonyms: ['audio implementation', 'wwise integration', 'fmod integration', 'audio scripting'],
    tip: 'Mention sound occlusion, reverb zones, and audio performance optimization.',
    exampleBullet: 'Implemented 3D spatialized audio with dynamic occlusion zones and real-time reverb volumes in-engine.',
  },

  // ── Production & QA
  {
    name: 'Agile & Scrum',
    category: 'Production & QA',
    synonyms: ['agile', 'scrum', 'sprint planning', 'kanban', 'jira'],
    tip: 'Mention running standups, retrospective meetings, and velocity metrics.',
    exampleBullet: 'Coordinated cross-discipline sprint deliverables as Scrum Master, unblocking teams and running bi-weekly sprint reviews.',
  },
  {
    name: 'Game Production',
    category: 'Production & QA',
    synonyms: ['game producer', 'production', 'milestone planning', 'roadmap', 'stakeholder management'],
    tip: 'Mention roadmap scheduling, budget tracking, and milestone submissions to publishers.',
    exampleBullet: 'Managed development milestones from pre-production to release, ensuring on-time delivery of publisher alpha and beta builds.',
  },
  {
    name: 'QA & Playtesting',
    category: 'Production & QA',
    synonyms: ['qa', 'quality assurance', 'bug reporting', 'test plan', 'playtesting', 'regression testing'],
    tip: 'Mention test matrices, regression testing, bug repro steps, and crash log analysis.',
    exampleBullet: 'Created comprehensive test matrices, executed smoke and regression tests, and logged 500+ prioritized bug reports in Jira.',
  },
  {
    name: 'LiveOps & Monetization',
    category: 'Production & QA',
    synonyms: ['liveops', 'live operations', 'monetization', 'battle pass', 'in-game events', 'retention'],
    tip: 'Mention seasonal battle passes, player retention events, and A/B test analytics.',
    exampleBullet: 'Orchestrated seasonal LiveOps battle pass events and in-game store refreshes, boosting 30-day player retention by 18%.',
  },

  // ── Platforms & Hardware
  {
    name: 'Console (PlayStation / Xbox / Switch)',
    category: 'Platforms & Hardware',
    synonyms: ['playstation', 'ps5', 'ps4', 'xbox', 'nintendo switch', 'console certification', 'trc', 'xr'],
    tip: 'Mention console SDKs, TRC/TCR certification compliance, and controller haptics.',
    exampleBullet: 'Ported and optimized title for PS5 and Xbox Series X, resolving all Sony TRC and Microsoft TCR compliance requirements.',
  },
  {
    name: 'PC & Steam',
    category: 'Platforms & Hardware',
    synonyms: ['steam', 'steamworks', 'steam sdk', 'pc gaming', 'epic games store'],
    tip: 'Mention Steamworks achievements, cloud saves, leaderboards, and workshop integration.',
    exampleBullet: 'Integrated Steamworks SDK for achievements, cloud saves, rich presence, and community workshop user content.',
  },
  {
    name: 'Mobile (iOS & Android)',
    category: 'Platforms & Hardware',
    synonyms: ['mobile games', 'ios', 'android', 'app store', 'google play', 'mobile optimization'],
    tip: 'Mention touch controls, battery conservation, memory caps, and store guidelines.',
    exampleBullet: 'Optimized touch input latency and thermal throttling on iOS and Android devices, keeping APK size under target limits.',
  },
  {
    name: 'VR / AR / XR',
    category: 'Platforms & Hardware',
    synonyms: ['vr', 'virtual reality', 'augmented reality', 'meta quest', 'spatial computing', 'openxr'],
    tip: 'Mention 90 FPS performance targets, OpenXR, motion controllers, and spatial ergonomics.',
    exampleBullet: 'Developed physics-driven VR interactions in OpenXR for Meta Quest 3, sustaining a steady 90 FPS with foveated rendering.',
  },
];

// ─── Local Storage Helpers ───────────────────────────────────────────────────
const STORAGE_KEY_RESUME_TEXT = 'gc_local_resume_text';
const STORAGE_KEY_RESUME_NAME = 'gc_local_resume_name';
const STORAGE_KEY_RESUME_DATE = 'gc_local_resume_date';

export function getSavedLocalResume(): { text: string; fileName: string; date: string } | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY_RESUME_TEXT);
    const fileName = localStorage.getItem(STORAGE_KEY_RESUME_NAME) || 'My Resume';
    const date = localStorage.getItem(STORAGE_KEY_RESUME_DATE) || new Date().toLocaleDateString();
    if (text && text.trim().length > 20) {
      return { text, fileName, date };
    }
  } catch { /* ignore */ }
  return null;
}

export function saveLocalResume(text: string, fileName: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESUME_TEXT, text);
    localStorage.setItem(STORAGE_KEY_RESUME_NAME, fileName);
    localStorage.setItem(STORAGE_KEY_RESUME_DATE, new Date().toLocaleDateString());
  } catch (err) {
    console.warn('Could not save resume to localStorage:', err);
  }
}

export function clearLocalResume(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RESUME_TEXT);
    localStorage.removeItem(STORAGE_KEY_RESUME_NAME);
    localStorage.removeItem(STORAGE_KEY_RESUME_DATE);
  } catch { /* ignore */ }
}

// ─── File Text Extraction ────────────────────────────────────────────────────
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (['txt', 'md', 'rtf', 'json', 'csv', 'html'].includes(extension)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  if (extension === 'docx') {
    return extractTextFromDocx(file);
  }

  if (extension === 'pdf') {
    return extractTextFromPdf(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unsupported file format.'));
    reader.readAsText(file);
  });
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const raw = decoder.decode(buffer);
    const matches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches && matches.length > 0) {
      return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
    }
    return raw.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
  } catch {
    throw new Error('Could not parse DOCX. Please paste your resume text directly.');
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder('latin1');
    const textContent = decoder.decode(bytes);

    const textPieces: string[] = [];
    const textBlockRegex = /BT[\s\S]*?ET/g;
    const tjRegex = /\((.*?)\)\s*Tj/g;
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;

    let match;
    while ((match = textBlockRegex.exec(textContent)) !== null) {
      const block = match[0];
      let subMatch;
      while ((subMatch = tjRegex.exec(block)) !== null) {
        textPieces.push(subMatch[1]);
      }
      while ((subMatch = tjArrayRegex.exec(block)) !== null) {
        subMatch[1].replace(/\(.*?\)/g, (str) => {
          textPieces.push(str.slice(1, -1));
          return '';
        });
      }
    }

    const result = textPieces
      .join(' ')
      .replace(/\\([()\\])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (result.length > 50) return result;

    const printable = textContent
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (printable.length > 100) return printable.slice(0, 10000);

    throw new Error('PDF is image-based or compressed. Please copy & paste your resume text.');
  } catch {
    throw new Error('Could not automatically extract text from this PDF. Please copy & paste your resume text.');
  }
}

// ─── Match & Improvement Plan Calculation ────────────────────────────────────

export function calculateJobMatch(resumeText: string, job: JobListing): ResumeMatchResult {
  const resume = resumeText.toLowerCase();
  const jobFullText = `${job.title} ${(job.tags || []).join(' ')} ${job.description || ''}`.toLowerCase();

  // Find all skills mentioned in the job posting
  const jobSkills: SkillDefinition[] = [];
  for (const skill of GAME_SKILLS_DATABASE) {
    const isPresentInJob = skill.synonyms.some(syn => jobFullText.includes(syn.toLowerCase()));
    if (isPresentInJob) {
      jobSkills.push(skill);
    }
  }

  // If job text is short and no explicit taxonomy matched, infer from title & tags
  if (jobSkills.length === 0) {
    const titleTokens = job.title.toLowerCase().split(/\W+/).filter(t => t.length > 3);
    for (const skill of GAME_SKILLS_DATABASE) {
      if (titleTokens.some(tok => skill.synonyms.some(s => s.includes(tok)))) {
        jobSkills.push(skill);
      }
    }
  }

  // Check which skills exist in resume
  const matchedSkills: SkillDefinition[] = [];
  const missingSkills: SkillDefinition[] = [];

  for (const skill of jobSkills) {
    const hasSkill = skill.synonyms.some(syn => resume.includes(syn.toLowerCase()));
    if (hasSkill) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Check bonus skills that the candidate has in reserve
  const candidateBonusSkills: SkillDefinition[] = [];
  for (const skill of GAME_SKILLS_DATABASE) {
    if (!jobSkills.includes(skill)) {
      const hasSkill = skill.synonyms.some(syn => resume.includes(syn.toLowerCase()));
      if (hasSkill) {
        candidateBonusSkills.push(skill);
      }
    }
  }

  // ── Calculate Score (0 - 100)
  let rawScore = 50;

  if (jobSkills.length > 0) {
    const directMatchRatio = matchedSkills.length / jobSkills.length;
    rawScore = directMatchRatio * 75;
    const bonusPoints = Math.min(candidateBonusSkills.length * 2.5, 20);
    rawScore += bonusPoints;
  } else {
    const resumeTokens = new Set(resume.split(/\W+/).filter(t => t.length > 3));
    const jobTokens = jobFullText.split(/\W+/).filter(t => t.length > 3);
    let common = 0;
    for (const token of jobTokens) {
      if (resumeTokens.has(token)) common++;
    }
    rawScore = Math.min(Math.round((common / Math.max(jobTokens.length * 0.3, 1)) * 100), 90);
  }

  // Check title words alignment
  const titleWords = job.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const matchingTitleWords = titleWords.filter(w => resume.includes(w));
  if (matchingTitleWords.length > 0) {
    rawScore += Math.min(matchingTitleWords.length * 3, 10);
  }

  const finalScore = Math.max(15, Math.min(Math.round(rawScore), 98));

  // Potential Score calculation (if missing skills added)
  const potentialScore = Math.min(98, Math.max(finalScore + missingSkills.length * 8, 92));

  // ── Determine Rating & Color
  let rating: ResumeMatchResult['rating'] = 'Good Match';
  let ratingColor = 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10';

  if (finalScore >= 85) {
    rating = 'Exceptional Match';
    ratingColor = 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15';
  } else if (finalScore >= 70) {
    rating = 'Strong Match';
    ratingColor = 'text-cyan-300 border-cyan-400/40 bg-cyan-500/15';
  } else if (finalScore >= 55) {
    rating = 'Good Match';
    ratingColor = 'text-blue-300 border-blue-400/40 bg-blue-500/15';
  } else if (finalScore >= 40) {
    rating = 'Moderate Fit';
    ratingColor = 'text-amber-300 border-amber-400/40 bg-amber-500/15';
  } else {
    rating = 'Low Match';
    ratingColor = 'text-gray-300 border-gray-400/30 bg-gray-500/10';
  }

  // ── High Impact Keywords & Actionable Guidance
  const highImpactKeywords: HighImpactKeyword[] = missingSkills.map(skill => {
    return {
      keyword: skill.name,
      category: skill.category,
      impactScore: Math.round(100 / Math.max(jobSkills.length, 1)),
      tip: skill.tip || `Highlight projects or experience where you used ${skill.name}.`,
      exampleBullet: skill.exampleBullet || `Utilized ${skill.name} to design, implement, and optimize core game deliverables.`,
    };
  });

  // ── Improvement Plan Generation
  const cleanTitle = job.title.replace(/^\[\d+\]\s*/, '').trim();
  const headlineSuggestion = `${cleanTitle} | ${matchedSkills.slice(0, 3).map(s => s.name).concat(missingSkills.slice(0, 2).map(s => s.name)).join(' • ')}`;

  const skillsSectionSuggestion = Array.from(
    new Set([...matchedSkills.map(s => s.name), ...missingSkills.map(s => s.name)])
  );

  const experienceBulletExamples = missingSkills
    .filter(s => Boolean(s.exampleBullet))
    .slice(0, 3)
    .map(s => s.exampleBullet!);

  if (experienceBulletExamples.length === 0) {
    experienceBulletExamples.push(
      `Engineered core gameplay systems and features for ${cleanTitle} role, collaborating closely with design and art teams.`,
      `Profiled and optimized performance bottlenecks across target platforms to maintain steady framerates.`
    );
  }

  const keyActionItems: string[] = [];
  if (missingSkills.length > 0) {
    keyActionItems.push(`Add ${missingSkills.length} missing skill keywords (${missingSkills.slice(0, 4).map(s => s.name).join(', ')}) into your Skills or Experience section.`);
  }
  if (!resume.includes(job.company.toLowerCase())) {
    keyActionItems.push(`Tailor your Summary statement to mention your enthusiasm for ${job.company}'s projects and game universe.`);
  }
  if (job.tags && job.tags.length > 0) {
    const missingTags = job.tags.filter(t => !resume.includes(t.toLowerCase()));
    if (missingTags.length > 0) {
      keyActionItems.push(`Incorporate domain tags: "${missingTags.join(', ')}" into your project descriptions.`);
    }
  }
  if (keyActionItems.length === 0) {
    keyActionItems.push(`Your resume is exceptionally well aligned with this ${cleanTitle} opening at ${job.company}!`);
  }

  // ── Group by Category
  const categories = Array.from(new Set(jobSkills.map(s => s.category)));
  const categoryBreakdown = categories.map(cat => {
    const catMatched = matchedSkills.filter(s => s.category === cat).map(s => s.name);
    const catMissing = missingSkills.filter(s => s.category === cat).map(s => s.name);
    const total = catMatched.length + catMissing.length;
    const catScore = total > 0 ? Math.round((catMatched.length / total) * 100) : 50;
    return {
      category: cat,
      matched: catMatched,
      missing: catMissing,
      score: catScore,
    };
  });

  // ── General Tailoring Tips
  const tailoringTips: string[] = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).map(s => s.name).join(', ');
    tailoringTips.push(`Highlight any direct experience or personal projects involving: ${topMissing}.`);
  }
  if (job.title.toLowerCase().includes('senior') && !resume.includes('senior') && !resume.includes('lead')) {
    tailoringTips.push(`This is a Senior/Lead position. Emphasize project leadership, architecture decisions, and mentoring.`);
  }
  if (/remote/i.test(job.location) || job.remote) {
    if (!resume.includes('remote') && !resume.includes('async')) {
      tailoringTips.push(`Highlight experience with asynchronous workflow, Git/Perforce collaboration, and distributed teams.`);
    }
  }
  if (tailoringTips.length === 0) {
    tailoringTips.push(`Your profile shows a direct match with ${job.company}'s requirements for ${job.title}!`);
  }

  return {
    score: finalScore,
    potentialScore,
    rating,
    ratingColor,
    matchedKeywords: matchedSkills.map(s => s.name),
    missingKeywords: missingSkills.map(s => s.name),
    highImpactKeywords,
    categoryBreakdown,
    improvementPlan: {
      headlineSuggestion,
      skillsSectionSuggestion,
      experienceBulletExamples,
      keyActionItems,
    },
    tailoringTips,
  };
}
