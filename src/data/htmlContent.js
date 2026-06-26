// ─── Pre-written HTML Theory Content ─────────────────────────────────────────
// Imported as raw HTML strings via Vite's ?raw query.
// Each item is { id, title, tags, icon, html } — rendered via iframe srcdoc.

// ─── DSA ─────────────────────────────────────────────────────────────────────
import dsaBlock2   from '../../html/dsa/dsa_block2_nonlinear_coach.html?raw'
import dsaBlock3   from '../../html/dsa/graph_dsa_coach_block3.html?raw'
import dsaBlock4   from '../../html/dsa/dsa_block4_coach.html?raw'
import dsaBlock5   from '../../html/dsa/dsa_block5_bible.html?raw'
import dsaBlock6   from '../../html/dsa/dsa_block6_dp_bible.html?raw'
import dsaBlock7   from '../../html/dsa/dsa_block7_greedy_bible.html?raw'
import dsaBlock8   from '../../html/dsa/dsa_block8_bitmanip_bible.html?raw'
import dsaMaster   from '../../html/dsa/dsa_master_reference.html?raw'

// ─── Java ─────────────────────────────────────────────────────────────────────
import javaOop        from '../../html/java/java_oop_visual_bible.html?raw'
import javaCollect    from '../../html/java/java_collections_visual_bible.html?raw'
import javaConcur     from '../../html/java/java_concurrency_visual_bible.html?raw'
import javaPatterns   from '../../html/java/java_design_patterns_bible.html?raw'
import javaFunctional from '../../html/java/java_functional_modern_bible.html?raw'
import javaJvm        from '../../html/java/java_jvm_memory_visual_bible.html?raw'
import javaAlgo       from '../../html/java/java_algorithms_visual_bible.html?raw'
import javaSolid      from '../../html/java/java_solid_clean_code_bible.html?raw'

// ─── CS Fundamentals ──────────────────────────────────────────────────────────
import csNetworks     from '../../html/csfundamendals/cs_fundamentals_block1_networks.html?raw'
import csOs           from '../../html/csfundamendals/cs_fundamentals_block2_os.html?raw'
import csDb           from '../../html/csfundamendals/cs_fundamentals_block3_databases.html?raw'
import csCompilers    from '../../html/csfundamendals/cs_fundamentals_block4_compilers.html?raw'
import csCrypto       from '../../html/csfundamendals/cs_fundamentals_block5_cryptography.html?raw'
import csDistrib      from '../../html/csfundamendals/cs_fundamentals_block6_distributed_systems.html?raw'
import csArch         from '../../html/csfundamendals/cs_fundamentals_block7_computer_architecture.html?raw'
import csMath         from '../../html/csfundamendals/cs_fundamentals_block8_math.html?raw'

// ─── System Design ────────────────────────────────────────────────────────────
import sdCaching      from '../../html/systemdesignhtml/system_design_caching_guide.html?raw'
import sdDatabases    from '../../html/systemdesignhtml/system_design_databases_guide.html?raw'
import sdDistributed  from '../../html/systemdesignhtml/system_design_distributed_systems_guide.html?raw'
import sdFoundations  from '../../html/systemdesignhtml/system_design_foundations_guide.html?raw'
import sdMessaging    from '../../html/systemdesignhtml/system_design_messaging_guide.html?raw'
import sdNetworking   from '../../html/systemdesignhtml/system_design_networking_guide.html?raw'
import sdProblems     from '../../html/systemdesignhtml/system_design_problems_guide.html?raw'
import sdReliability  from '../../html/systemdesignhtml/system_design_reliability_operations_guide.html?raw'
import sdStorage      from '../../html/systemdesignhtml/system_design_storage_systems_guide.html?raw'

// ─── JS / Browser ─────────────────────────────────────────────────────────────
import jsBrowser     from '../../html/js/browser_internals_block1.html?raw'
import jsInternals   from '../../html/js/js_deep_internals_block2.html?raw'
import jsReact       from '../../html/js/react_internals_block3.html?raw'
import jsPerf        from '../../html/js/performance_engineering_block4.html?raw'
import jsState       from '../../html/js/state_management_block5.html?raw'
import jsNetworking  from '../../html/js/networking_browser_block6.html?raw'
import jsSecurity    from '../../html/js/security_block7.html?raw'
import jsArch        from '../../html/js/architecture_patterns_block8.html?raw'

// ─── Export map keyed by CATEGORIES[*].id ─────────────────────────────────────
export const HTML_SECTIONS = {
  DSA: [
    { id: 'dsa-nonlinear', title: 'Non-Linear Data Structures',      icon: '🌲', tags: ['trees','heaps','tries'],         html: dsaBlock2 },
    { id: 'dsa-graphs',    title: 'Graphs — BFS, DFS & Pathfinding', icon: '🕸️', tags: ['graphs','bfs','dfs','dijkstra'],  html: dsaBlock3 },
    { id: 'dsa-sorting',   title: 'Sorting & Searching',             icon: '📊', tags: ['sorting','binary-search'],       html: dsaBlock4 },
    { id: 'dsa-bible',     title: 'DSA Bible — Core Patterns',       icon: '📖', tags: ['patterns','reference'],          html: dsaBlock5 },
    { id: 'dsa-dp',        title: 'Dynamic Programming',             icon: '🧮', tags: ['dp','memoization','tabulation'], html: dsaBlock6 },
    { id: 'dsa-greedy',    title: 'Greedy Algorithms',               icon: '💹', tags: ['greedy','intervals'],            html: dsaBlock7 },
    { id: 'dsa-bitmanip',  title: 'Bit Manipulation',                icon: '⚡', tags: ['bitwise','xor','shifts'],        html: dsaBlock8 },
    { id: 'dsa-master',    title: 'DSA Master Reference',            icon: '🗂️', tags: ['cheatsheet','patterns','all'],   html: dsaMaster  },
  ],
  Java: [
    { id: 'java-oop',      title: 'OOP — Visual Bible',          icon: '🏗️', tags: ['oop','classes','inheritance','polymorphism'], html: javaOop },
    { id: 'java-coll',     title: 'Collections Framework',       icon: '📦', tags: ['list','map','set','queue','deque'],          html: javaCollect },
    { id: 'java-conc',     title: 'Concurrency & Threading',     icon: '🔀', tags: ['threads','locks','executor','async'],        html: javaConcur },
    { id: 'java-patterns', title: 'Design Patterns',             icon: '🧩', tags: ['patterns','creational','structural'],        html: javaPatterns },
    { id: 'java-func',     title: 'Functional & Modern Java',    icon: '🚀', tags: ['streams','lambdas','java8','optional'],      html: javaFunctional },
    { id: 'java-jvm',      title: 'JVM Memory & Internals',      icon: '💾', tags: ['jvm','gc','heap','stack','classloader'],    html: javaJvm },
    { id: 'java-algo',     title: 'Algorithms in Java',          icon: '📐', tags: ['sorting','searching','complexity'],          html: javaAlgo },
    { id: 'java-solid',    title: 'SOLID & Clean Code',          icon: '✨', tags: ['solid','clean-code','refactoring','dry'],   html: javaSolid },
  ],
  'CS Fundamentals': [
    { id: 'cs-networks',  title: 'Networks & Protocols',      icon: '🌐', tags: ['tcp','http','dns','osi'],               html: csNetworks },
    { id: 'cs-os',        title: 'Operating Systems',         icon: '🖥️', tags: ['processes','threads','memory','io'],  html: csOs },
    { id: 'cs-db',        title: 'Databases Fundamentals',   icon: '🗃️', tags: ['sql','indexes','acid','normalization'],  html: csDb },
    { id: 'cs-compilers', title: 'Compilers & Interpreters',  icon: '⚙️', tags: ['parsing','lexer','ast','codegen'],      html: csCompilers },
    { id: 'cs-crypto',    title: 'Cryptography',              icon: '🔐', tags: ['hashing','encryption','tls','pki'],     html: csCrypto },
    { id: 'cs-distrib',   title: 'Distributed Systems',       icon: '📡', tags: ['cap','consensus','replication'],        html: csDistrib },
    { id: 'cs-arch',      title: 'Computer Architecture',     icon: '🔧', tags: ['cpu','memory','cache','assembly'],      html: csArch },
    { id: 'cs-math',      title: 'CS Math & Discrete Math',   icon: '📐', tags: ['logic','complexity','graphs','proofs'], html: csMath },
  ],
  'System Design': [
    { id: 'sd-foundations', title: 'System Design Foundations',    icon: '🏛️', tags: ['scalability','load-balancing'],           html: sdFoundations },
    { id: 'sd-caching',     title: 'Caching Strategies',           icon: '⚡', tags: ['redis','memcached','cdn','cache-aside'],   html: sdCaching },
    { id: 'sd-databases',   title: 'Databases at Scale',           icon: '🗃️', tags: ['sharding','replication','nosql','sql'],    html: sdDatabases },
    { id: 'sd-distributed', title: 'Distributed Systems',          icon: '📡', tags: ['cap','consistency','availability'],        html: sdDistributed },
    { id: 'sd-messaging',   title: 'Messaging & Event Streaming',  icon: '✉️', tags: ['kafka','queues','pub-sub','events'],       html: sdMessaging },
    { id: 'sd-networking',  title: 'Networking Deep Dive',         icon: '🌐', tags: ['tcp','http2','grpc','websockets'],         html: sdNetworking },
    { id: 'sd-reliability', title: 'Reliability & Operations',     icon: '🛡️', tags: ['sre','monitoring','alerting','slo'],      html: sdReliability },
    { id: 'sd-storage',     title: 'Storage Systems',              icon: '💽', tags: ['object-store','block-store','dfs'],        html: sdStorage },
    { id: 'sd-problems',    title: 'System Design Problems',       icon: '🧩', tags: ['interviews','case-studies','examples'],   html: sdProblems },
  ],
  'Full Stack': [
    { id: 'js-browser',     title: 'Browser Internals',        icon: '🌍', tags: ['dom','event-loop','rendering','v8'],       html: jsBrowser },
    { id: 'js-internals',   title: 'JS Deep Internals',        icon: '⚙️', tags: ['closures','prototypes','async','engine'],  html: jsInternals },
    { id: 'js-react',       title: 'React Internals',          icon: '⚛️', tags: ['fiber','reconciliation','hooks','vdom'],   html: jsReact },
    { id: 'js-perf',        title: 'Performance Engineering',  icon: '🚀', tags: ['profiling','web-vitals','bundling'],       html: jsPerf },
    { id: 'js-state',       title: 'State Management',         icon: '🗂️', tags: ['redux','zustand','context','patterns'],    html: jsState },
    { id: 'js-networking',  title: 'Networking & Browser',     icon: '🌐', tags: ['fetch','websockets','http','cors'],         html: jsNetworking },
    { id: 'js-security',    title: 'Web Security',             icon: '🔐', tags: ['xss','csrf','csp','auth','owasp'],         html: jsSecurity },
    { id: 'js-arch',        title: 'Architecture Patterns',    icon: '🏗️', tags: ['patterns','mvc','micro-frontends'],        html: jsArch },
  ],
}

// Utility: check if a category has theory content
export function hasTheory(categoryId) {
  return !!(HTML_SECTIONS[categoryId]?.length)
}
