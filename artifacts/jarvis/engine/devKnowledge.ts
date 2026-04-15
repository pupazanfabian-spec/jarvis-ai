
// Jarvis Dev Knowledge — 500+ concepte de programare, comparații stack, 20+ template-uri app

export interface DevConcept {
  id: string;
  label: string;
  category: string;
  description: string;
  example?: string;
  related?: string[];
}

export interface AppTemplateStep {
  name: string;
  description: string;
  language: string;
  content: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  stack?: string;
  description: string;
  files?: { path: string; content: string }[];
  dependencies?: string[];
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  steps?: AppTemplateStep[];
}

// ─── Concepte de Programare (~500) ────────────────────────────────────────────

export const DEV_CONCEPTS: Record<string, DevConcept> = {
  // ── Concepte Fundamentale ──
  variabila: {
    id: 'variabila',
    label: 'Variabilă',
    category: 'fundamentale',
    description: 'Un container care stochează o valoare. În JS: let, const, var. const = imutabil, let = mutabil în bloc, var = hoisted.',
    example: 'const name = "Jarvis";\nlet count = 0;\ncount += 1;',
    related: ['tip_date', 'scope', 'hoisting'],
  },
  functie: {
    id: 'functie',
    label: 'Funcție',
    category: 'fundamentale',
    description: 'Bloc reutilizabil de cod. Arrow functions în JS: (params) => result. Funcțiile sunt first-class objects în JS.',
    example: 'const add = (a: number, b: number) => a + b;\nconst greet = (name: string): string => `Salut, ${name}!`;',
    related: ['closure', 'callback', 'async_await'],
  },
  clasa: {
    id: 'clasa',
    label: 'Clasă (OOP)',
    category: 'oop',
    description: 'Plan pentru crearea obiectelor. Encapsulare, moștenire, polimorfism. TypeScript: class Name { constructor() {} }',
    example: 'class Animal {\n  name: string;\n  constructor(name: string) { this.name = name; }\n  speak(): string { return `${this.name} vorbește`; }\n}\nclass Dog extends Animal {\n  speak() { return `${this.name} latră!`; }\n}',
    related: ['mostenire', 'interfata', 'abstract'],
  },
  interfata: {
    id: 'interfata',
    label: 'Interfață (TypeScript)',
    category: 'typescript',
    description: 'Contract de tipuri. Definește forma unui obiect. Interface vs Type: interface e extensibilă, type e mai flexibil.',
    example: 'interface User {\n  id: string;\n  name: string;\n  email?: string; // opțional\n}\nconst user: User = { id: "1", name: "Ion" };',
    related: ['tip_date', 'generics', 'clasa'],
  },
  generics: {
    id: 'generics',
    label: 'Generics TypeScript',
    category: 'typescript',
    description: 'Tipuri parametrizate — cod care funcționează cu orice tip, dar rămâne type-safe.',
    example: 'function identity<T>(value: T): T { return value; }\nconst arr = identity<string[]>(["a", "b"]);\n\ninterface ApiResponse<T> {\n  data: T;\n  error?: string;\n}',
    related: ['interfata', 'tip_date'],
  },
  async_await: {
    id: 'async_await',
    label: 'Async/Await',
    category: 'javascript',
    description: 'Sintaxă pentru cod asincron. async face funcția să returneze Promise, await suspendă execuția până la rezolvare.',
    example: 'async function fetchUser(id: string) {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error("Eroare:", err);\n    return null;\n  }\n}',
    related: ['promise', 'callback', 'functie'],
  },
  promise: {
    id: 'promise',
    label: 'Promise',
    category: 'javascript',
    description: 'Obiect care reprezintă o operație asincronă. Stări: pending, fulfilled, rejected. Promise.all = paralel, Promise.any = primul.',
    example: 'const p = new Promise<string>((resolve, reject) => {\n  setTimeout(() => resolve("gata!"), 1000);\n});\n\n// Paralel\nconst [a, b] = await Promise.all([fetchA(), fetchB()]);',
    related: ['async_await', 'callback'],
  },
  closure: {
    id: 'closure',
    label: 'Closure',
    category: 'javascript',
    description: 'Funcție care "reține" variabilele din scope-ul exterior chiar după ce funcția exterioară s-a executat.',
    example: 'function makeCounter() {\n  let count = 0;\n  return () => ++count; // reține "count"\n}\nconst c = makeCounter();\nc(); // 1\nc(); // 2',
    related: ['functie', 'scope', 'variabila'],
  },
  scope: {
    id: 'scope',
    label: 'Scope',
    category: 'javascript',
    description: 'Vizibilitatea variabilelor. Global, funcție, bloc. let/const au scope de bloc, var are scope de funcție.',
    example: '{\n  let x = 10; // block scope\n  var y = 20; // function scope\n}\n// x nu e accesibil aici, y e accesibil',
    related: ['variabila', 'closure', 'hoisting'],
  },
  hoisting: {
    id: 'hoisting',
    label: 'Hoisting',
    category: 'javascript',
    description: 'JS mută declarațiile de var și function în vârful scope-ului. let/const nu sunt hoisted (Temporal Dead Zone).',
    example: 'console.log(x); // undefined (hoisted)\nvar x = 5;\n\nconsole.log(y); // ReferenceError! (TDZ)\nlet y = 5;',
    related: ['scope', 'variabila'],
  },
  map_filter_reduce: {
    id: 'map_filter_reduce',
    label: 'Map / Filter / Reduce',
    category: 'javascript',
    description: 'Metode de array funcționale. map=transformare, filter=filtrare, reduce=agregare. Imutabile — returnează array nou.',
    example: 'const nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2); // [2,4,6,8,10]\nconst even = nums.filter(n => n % 2 === 0); // [2,4]\nconst sum = nums.reduce((acc, n) => acc + n, 0); // 15',
    related: ['array', 'functie'],
  },
  destructuring: {
    id: 'destructuring',
    label: 'Destructuring',
    category: 'javascript',
    description: 'Extrage valori din obiecte/array-uri concis. Suportă valori default și aliasuri.',
    example: 'const { name, age = 18 } = user;\nconst [first, ...rest] = array;\nconst { data: { items } } = response; // nested',
    related: ['spread', 'variabila'],
  },
  spread: {
    id: 'spread',
    label: 'Spread / Rest',
    category: 'javascript',
    description: '... operator. Spread = expandare, Rest = colectare. Immutability pattern pentru obiecte/array-uri.',
    example: 'const merged = { ...obj1, ...obj2 };\nconst arr2 = [...arr1, newItem];\nfunction sum(...nums: number[]) { return nums.reduce((a,b)=>a+b,0); }',
    related: ['destructuring', 'array'],
  },
  // ── React ──
  hooks: {
    id: 'hooks',
    label: 'React Hooks',
    category: 'react',
    description: 'Funcții care adaugă stare și lifecycle la componente funcționale. Regulă: nu în if-uri/loop-uri.',
    example: 'const [count, setCount] = useState(0);\nconst value = useMemo(() => compute(), [deps]);\nconst fn = useCallback(() => action(), [deps]);\nuseEffect(() => { /* side effect */ return () => { /* cleanup */ }; }, [deps]);',
    related: ['usestate', 'useeffect', 'usememo', 'usecallback', 'useref'],
  },
  usestate: {
    id: 'usestate',
    label: 'useState',
    category: 'react',
    description: 'Stare locală a componentei. Re-render la fiecare setState. Updater funcțional pentru valori care depind de starea anterioară.',
    example: 'const [items, setItems] = useState<string[]>([]);\n\n// Updater funcțional — sigur\nsetItems(prev => [...prev, newItem]);\n\n// Obiect\nconst [form, setForm] = useState({ name: "", email: "" });\nsetForm(prev => ({ ...prev, name: "Ion" }));',
    related: ['hooks', 'useeffect'],
  },
  useeffect: {
    id: 'useeffect',
    label: 'useEffect',
    category: 'react',
    description: 'Side effects: fetch, subscripții, DOM. [] = mount only, [dep] = la schimbare dep, fără array = la fiecare render.',
    example: 'useEffect(() => {\n  const sub = subscribe(id);\n  return () => sub.unsubscribe(); // cleanup\n}, [id]);\n\n// Fetch la mount\nuseEffect(() => {\n  fetchData().then(setData);\n}, []);',
    related: ['hooks', 'usestate'],
  },
  usememo: {
    id: 'usememo',
    label: 'useMemo',
    category: 'react',
    description: 'Memoizează o valoare costisitor calculată. Re-calculează doar când dependințele se schimbă. Nu folosi excesiv.',
    example: 'const sortedItems = useMemo(\n  () => items.sort((a, b) => a.name.localeCompare(b.name)),\n  [items]\n);',
    related: ['hooks', 'usecallback', 'performance'],
  },
  usecallback: {
    id: 'usecallback',
    label: 'useCallback',
    category: 'react',
    description: 'Memoizează o funcție. Util când funcția e pasată ca prop la componente memoizate (React.memo).',
    example: 'const handlePress = useCallback(() => {\n  doSomething(id);\n}, [id]); // se re-creează doar când id se schimbă',
    related: ['hooks', 'usememo'],
  },
  useref: {
    id: 'useref',
    label: 'useRef',
    category: 'react',
    description: 'Referință mutabilă care NU provoacă re-render la schimbare. Utilizări: referință DOM, valori "previous", timere.',
    example: 'const inputRef = useRef<TextInput>(null);\nconst timerRef = useRef<ReturnType<typeof setTimeout>>(); // timer\nconst prevValue = useRef(value); // valoare anterioară\n\ninputRef.current?.focus();',
    related: ['hooks'],
  },
  usecontext: {
    id: 'usecontext',
    label: 'useContext',
    category: 'react',
    description: 'Citește valoarea unui Context. Evită prop drilling. Re-render la orice schimbare de context.',
    example: 'const ThemeContext = createContext<Theme>(defaultTheme);\n\n// Provider\n<ThemeContext.Provider value={theme}>\n  {children}\n</ThemeContext.Provider>\n\n// Consumer\nconst theme = useContext(ThemeContext);',
    related: ['hooks', 'context'],
  },
  context: {
    id: 'context',
    label: 'React Context',
    category: 'react',
    description: 'Stare globală fără prop drilling. createContext + Provider + useContext. Alternativă simplă la Redux.',
    example: 'interface AuthCtx { user: User | null; login: (u: User) => void; }\nconst AuthContext = createContext<AuthCtx | null>(null);\n\nexport function AuthProvider({ children }) {\n  const [user, setUser] = useState<User | null>(null);\n  return (\n    <AuthContext.Provider value={{ user, login: setUser }}>\n      {children}\n    </AuthContext.Provider>\n  );\n}',
    related: ['usecontext', 'hooks'],
  },
  react_native: {
    id: 'react_native',
    label: 'React Native',
    category: 'react-native',
    description: 'Framework pentru apps mobile cu React. View=div, Text=span, StyleSheet=CSS-in-JS. Compilează la cod nativ.',
    example: 'import { View, Text, StyleSheet, TouchableOpacity } from "react-native";\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: "#0A0A0F" },\n  text: { color: "#fff", fontSize: 16 },\n});\n\n<View style={styles.container}>\n  <Text style={styles.text}>Salut!</Text>\n</View>',
    related: ['expo', 'flexbox', 'stylesheet'],
  },
  expo: {
    id: 'expo',
    label: 'Expo',
    category: 'react-native',
    description: 'Platform pentru React Native. Expo Router = routing bazat pe fișiere. expo-* = biblioteci native (camera, FS, etc).',
    example: '// app/(tabs)/index.tsx — rută automată /\nexport default function HomeScreen() {\n  return <View><Text>Home</Text></View>;\n}\n\n// Navigare\nimport { router } from "expo-router";\nrouter.push("/settings");',
    related: ['react_native', 'expo_router'],
  },
  flexbox: {
    id: 'flexbox',
    label: 'Flexbox în React Native',
    category: 'styling',
    description: 'RN folosește Flexbox pentru layout. flexDirection default = column (spre deosebire de web = row). flex=1 = ocupă spațiul disponibil.',
    example: 'container: {\n  flex: 1,\n  flexDirection: "row",\n  justifyContent: "space-between", // axa principală\n  alignItems: "center",           // axa secundară\n  gap: 8,\n}',
    related: ['react_native', 'stylesheet'],
  },
  // ── Backend / Node ──
  rest_api: {
    id: 'rest_api',
    label: 'REST API',
    category: 'backend',
    description: 'Arhitectură API bazată pe HTTP. GET=citire, POST=creare, PUT=înlocuire, PATCH=modificare parțială, DELETE=ștergere.',
    example: 'GET    /api/users          // Lista\nGET    /api/users/:id      // Un user\nPOST   /api/users          // Creare\nPATCH  /api/users/:id      // Update parțial\nDELETE /api/users/:id      // Ștergere',
    related: ['express', 'json', 'http_status'],
  },
  express: {
    id: 'express',
    label: 'Express.js',
    category: 'backend',
    description: 'Framework minimal pentru Node.js. Middleware = funcții care procesează request-urile în lanț.',
    example: 'import express from "express";\nconst app = express();\napp.use(express.json());\n\napp.get("/users/:id", async (req, res) => {\n  const user = await db.findById(req.params.id);\n  if (!user) return res.status(404).json({ error: "Not found" });\n  res.json(user);\n});\n\napp.listen(3000);',
    related: ['rest_api', 'middleware', 'nodejs'],
  },
  middleware: {
    id: 'middleware',
    label: 'Middleware',
    category: 'backend',
    description: 'Funcție care interceptează request-ul înainte de handler. Uzual: auth, logging, validare, CORS.',
    example: 'const authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization?.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "Unauthorized" });\n  // Verifică token...\n  next(); // Continuă lanțul\n};',
    related: ['express', 'auth'],
  },
  sqlite: {
    id: 'sqlite',
    label: 'SQLite',
    category: 'database',
    description: 'Bază de date relațională fișier-based, fără server. Perfectă pentru apps mobile. expo-sqlite în React Native.',
    example: 'import * as SQLite from "expo-sqlite";\n\nconst db = await SQLite.openDatabaseAsync("jarvis.db");\nawait db.execAsync(`\n  CREATE TABLE IF NOT EXISTS users (\n    id TEXT PRIMARY KEY,\n    name TEXT NOT NULL\n  );\n`);\nawait db.runAsync("INSERT INTO users VALUES (?, ?)", ["1", "Ion"]);',
    related: ['database', 'sql'],
  },
  sql: {
    id: 'sql',
    label: 'SQL de bază',
    category: 'database',
    description: 'Limbaj pentru baze de date relaționale. CRUD: SELECT, INSERT, UPDATE, DELETE. JOIN pentru relații între tabele.',
    example: 'SELECT u.name, p.title\nFROM users u\nJOIN posts p ON p.user_id = u.id\nWHERE u.active = 1\nORDER BY p.created_at DESC\nLIMIT 10;\n\nINSERT INTO users (id, name) VALUES (?, ?);\nUPDATE users SET name = ? WHERE id = ?;\nDELETE FROM users WHERE id = ?;',
    related: ['sqlite', 'database'],
  },
  // ── TypeScript ──
  typescript_basics: {
    id: 'typescript_basics',
    label: 'TypeScript Basics',
    category: 'typescript',
    description: 'Superset al JS cu tipuri statice. Prinde erori la compilare. Tipuri: string, number, boolean, array, union, intersection.',
    example: 'type Status = "active" | "inactive" | "pending"; // union\ntype Admin = User & { permissions: string[] }; // intersection\ntype Maybe<T> = T | null | undefined;\n\nfunction process(input: string | number): string {\n  if (typeof input === "number") return input.toString();\n  return input;\n}',
    related: ['generics', 'interfata'],
  },
  // ── Algoritmi ──
  big_o: {
    id: 'big_o',
    label: 'Big O Notation',
    category: 'algoritmi',
    description: 'Complexitate temporală: O(1)=constant, O(log n)=logaritmic, O(n)=liniar, O(n²)=pătratic. Spațiu similar.',
    example: 'O(1)    — accesare element array: arr[0]\nO(log n) — binary search\nO(n)    — parcurgere array: for...of\nO(n log n) — sort bun: mergesort, timsort\nO(n²)   — nested loops: bubble sort',
    related: ['algoritmi', 'sortare', 'cautare'],
  },
  sortare: {
    id: 'sortare',
    label: 'Algoritmi de Sortare',
    category: 'algoritmi',
    description: 'Bubble Sort O(n²), Merge Sort O(n log n), Quick Sort O(n log n) avg. JavaScript .sort() = TimSort O(n log n).',
    example: '// Merge Sort\nfunction mergeSort(arr: number[]): number[] {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}',
    related: ['big_o', 'algoritmi'],
  },
  recursivitate: {
    id: 'recursivitate',
    label: 'Recursivitate',
    category: 'algoritmi',
    description: 'Funcție care se apelează pe sine. Necesită: caz de bază (stop) + caz recursiv. Risk: stack overflow.',
    example: 'function factorial(n: number): number {\n  if (n <= 1) return 1; // caz de bază\n  return n * factorial(n - 1); // caz recursiv\n}\n\n// Fibonacci cu memoizare\nconst memo: Record<number, number> = {};\nfunction fib(n: number): number {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fib(n-1) + fib(n-2);\n}',
    related: ['algoritmi', 'big_o'],
  },
  // ── Design Patterns ──
  singleton: {
    id: 'singleton',
    label: 'Singleton Pattern',
    category: 'design-patterns',
    description: 'O singură instanță a clasei, accesibilă global. Util pentru: config, connection pool, logger.',
    example: 'class Database {\n  private static instance: Database;\n  private constructor() {}\n  \n  static getInstance(): Database {\n    if (!Database.instance) {\n      Database.instance = new Database();\n    }\n    return Database.instance;\n  }\n}',
    related: ['clasa', 'design-patterns'],
  },
  observer: {
    id: 'observer',
    label: 'Observer Pattern',
    category: 'design-patterns',
    description: 'Obiect (Subject) notifică toți observatorii când starea se schimbă. Baza React Context, EventEmitter.',
    example: 'class EventEmitter {\n  private listeners = new Map<string, Function[]>();\n  \n  on(event: string, fn: Function) {\n    const list = this.listeners.get(event) ?? [];\n    this.listeners.set(event, [...list, fn]);\n  }\n  \n  emit(event: string, data?: any) {\n    this.listeners.get(event)?.forEach(fn => fn(data));\n  }\n}',
    related: ['design-patterns'],
  },
  factory: {
    id: 'factory',
    label: 'Factory Pattern',
    category: 'design-patterns',
    description: 'Creează obiecte fără a expune logica de creare. Flexibil pentru tipuri multiple.',
    example: 'type Shape = Circle | Square;\n\nfunction createShape(type: "circle" | "square", size: number): Shape {\n  if (type === "circle") return new Circle(size);\n  return new Square(size);\n}',
    related: ['design-patterns', 'clasa'],
  },
  // ── Git ──
  git: {
    id: 'git',
    label: 'Git Esențial',
    category: 'tools',
    description: 'Control versiune distribuit. Workflow: branch → commit → push → PR → merge.',
    example: 'git init\ngit add .\ngit commit -m "feat: adaugă autentificare"\ngit checkout -b feature/new-feature\ngit merge main\ngit push origin feature/new-feature\n\n# Revert la ultimul commit\ngit reset --soft HEAD~1',
    related: ['github', 'ci_cd'],
  },
  // ── Securitate ──
  auth_jwt: {
    id: 'auth_jwt',
    label: 'JWT Authentication',
    category: 'securitate',
    description: 'JSON Web Token — token semnat digital. Header.Payload.Signature. Verificat fără DB. Expire time important!',
    example: '// Sign\nconst token = jwt.sign({ userId: "123" }, SECRET, { expiresIn: "7d" });\n\n// Verify\ntry {\n  const payload = jwt.verify(token, SECRET) as { userId: string };\n  return payload.userId;\n} catch { throw new Error("Token invalid"); }',
    related: ['securitate', 'middleware', 'auth'],
  },
  hashing: {
    id: 'hashing',
    label: 'Hashing Parole',
    category: 'securitate',
    description: 'NICIODATĂ nu stoca parole în clar! bcrypt/argon2 = hashing adaptiv cu salt. Cost factor controlează viteza.',
    example: 'import bcrypt from "bcrypt";\n\n// Înregistrare\nconst hash = await bcrypt.hash(password, 12); // cost=12\nawait db.save({ email, password: hash });\n\n// Login\nconst isValid = await bcrypt.compare(inputPassword, hash);',
    related: ['securitate', 'auth_jwt'],
  },
  // ── Performance ──
  lazy_loading: {
    id: 'lazy_loading',
    label: 'Lazy Loading',
    category: 'performance',
    description: 'Încarcă resurse/componente doar când sunt necesare. React.lazy() + Suspense pentru componente.',
    example: 'const HeavyComponent = React.lazy(() => import("./HeavyComponent"));\n\n<Suspense fallback={<Loading />}>\n  <HeavyComponent />\n</Suspense>',
    related: ['performance', 'code_splitting'],
  },
  memoizare: {
    id: 'memoizare',
    label: 'Memoizare',
    category: 'performance',
    description: 'Cache rezultate funcții pure. React.memo pentru componente, useMemo pentru valori, useCallback pentru funcții.',
    example: 'const MemoComp = React.memo(({ name }: { name: string }) => {\n  return <Text>{name}</Text>;\n}); // Re-render doar când name se schimbă\n\nfunction memoize<T>(fn: (...args: any[]) => T) {\n  const cache = new Map();\n  return (...args: any[]): T => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}',
    related: ['usememo', 'usecallback', 'performance'],
  },
  // ── Testing ──
  testing: {
    id: 'testing',
    label: 'Testing',
    category: 'testing',
    description: 'Unit tests (funcții izolate), Integration tests (module + DB), E2E (flow complet). Jest + Testing Library.',
    example: '// Jest\ndescribe("add function", () => {\n  it("adds two numbers correctly", () => {\n    expect(add(2, 3)).toBe(5);\n    expect(add(-1, 1)).toBe(0);\n  });\n  \n  it("handles edge cases", () => {\n    expect(add(0, 0)).toBe(0);\n  });\n});',
    related: ['jest', 'tdd'],
  },
  // ── Comparații Stack ──
  react_vs_vue: {
    id: 'react_vs_vue',
    label: 'React vs Vue',
    category: 'comparatii',
    description: 'React: JSX, unidirecțional, ecosistem mare. Vue: template syntax, two-way binding, mai ușor de început. Ambele SPA.',
    example: '// React\nconst [count, setCount] = useState(0);\n<button onClick={() => setCount(c => c+1)}>{count}</button>\n\n// Vue\nconst count = ref(0);\n<button @click="count++">{{ count }}</button>',
    related: ['react', 'vue', 'angular'],
  },
  sql_vs_nosql: {
    id: 'sql_vs_nosql',
    label: 'SQL vs NoSQL',
    category: 'comparatii',
    description: 'SQL: relațional, scheme fixe, ACID, JOIN-uri. NoSQL: schema-less, scalare orizontală. MongoDB, Redis, Cassandra.',
    example: 'SQL: PostgreSQL, MySQL, SQLite\n  → Relații clare, tranzacții, date structurate\n\nNoSQL:\n  Document: MongoDB (JSON-like)\n  Key-Value: Redis (cache, sesiuni)\n  Column: Cassandra (big data)\n  Graph: Neo4j (rețele sociale)',
    related: ['database', 'sql', 'mongodb'],
  },
  rest_vs_graphql: {
    id: 'rest_vs_graphql',
    label: 'REST vs GraphQL',
    category: 'comparatii',
    description: 'REST: resurse fixe, mai simplu. GraphQL: client specifică exact ce date vrea, un singur endpoint, overfetching eliminat.',
    example: '// REST — primești tot userul\nGET /api/users/123 → { id, name, email, avatar, ... }\n\n// GraphQL — specifici exact ce vrei\nquery {\n  user(id: "123") {\n    name\n    email\n  }\n}',
    related: ['rest_api', 'api'],
  },
  // ── Erori Comune ──
  null_undefined: {
    id: 'null_undefined',
    label: 'null vs undefined',
    category: 'javascript',
    description: 'undefined = declarat dar neinițializat. null = absența intenționată a valorii. Optional chaining ?. și nullish ??',
    example: 'let x; // undefined\nlet y = null; // null intenționat\n\n// Optional chaining\nconst name = user?.profile?.name; // undefined dacă user e null\n\n// Nullish coalescing\nconst display = name ?? "Anonim"; // "Anonim" dacă name e null/undefined',
    related: ['variabila', 'typescript_basics'],
  },
  // ── State Management ──
  zustand: {
    id: 'zustand',
    label: 'Zustand',
    category: 'state-management',
    description: 'State management minimal pentru React. Mai simplu decât Redux. create() definește store, useStore() consumă.',
    example: 'import { create } from "zustand";\n\ninterface Store {\n  count: number;\n  increment: () => void;\n}\n\nconst useStore = create<Store>(set => ({\n  count: 0,\n  increment: () => set(state => ({ count: state.count + 1 })),\n}));\n\n// Componentă\nconst count = useStore(state => state.count);',
    related: ['react', 'context', 'redux'],
  },
  redux: {
    id: 'redux',
    label: 'Redux Toolkit',
    category: 'state-management',
    description: 'State management predictibil. Actions → Reducers → Store. Redux Toolkit simplifică setup-ul clasic.',
    example: 'const counterSlice = createSlice({\n  name: "counter",\n  initialState: { value: 0 },\n  reducers: {\n    increment: state => { state.value += 1; },\n    decrement: state => { state.value -= 1; },\n  },\n});\n\nexport const { increment, decrement } = counterSlice.actions;',
    related: ['zustand', 'context'],
  },

  // ── JavaScript Avansat ──
  event_loop: {
    id: 'event_loop',
    label: 'Event Loop',
    category: 'javascript',
    description: 'Mecanismul JS de concurență single-thread. Call Stack → Web APIs → Callback Queue → Microtask Queue. Promises = microtask, setTimeout = macrotask.',
    example: 'console.log("1");\nsetTimeout(() => console.log("3"), 0);\nPromise.resolve().then(() => console.log("2"));\n// Output: 1, 2, 3\n// Promises (microtask) au prioritate față de setTimeout (macrotask)',
    related: ['promise', 'async_await', 'callback'],
  },
  prototype: {
    id: 'prototype',
    label: 'Prototype Chain',
    category: 'javascript',
    description: 'Moștenire prototipală JS. Fiecare obiect are __proto__ care pointează la prototipul său. Baza OOP în JS înainte de class.',
    example: 'function Animal(name) { this.name = name; }\nAnimal.prototype.speak = function() { return `${this.name} vorbeste`; };\n\nconst dog = new Animal("Rex");\ndog.speak(); // "Rex vorbeste"\ndog.__proto__ === Animal.prototype; // true',
    related: ['clasa', 'mostenire'],
  },
  module_system: {
    id: 'module_system',
    label: 'Module System (ESM/CJS)',
    category: 'javascript',
    description: 'ESM (ES Modules): import/export static. CJS (CommonJS): require/module.exports. Node.js suportă ambele. Treeshaking funcționează cu ESM.',
    example: '// ESM\nexport const add = (a, b) => a + b;\nexport default class MyClass {}\nimport { add } from "./math";\nimport MyClass from "./MyClass";\n\n// CJS\nmodule.exports = { add };\nconst { add } = require("./math");',
    related: ['import_export', 'treeshaking'],
  },
  error_handling: {
    id: 'error_handling',
    label: 'Error Handling',
    category: 'javascript',
    description: 'try/catch/finally + custom errors. Async: try/catch cu await sau .catch() pe Promise. Error boundary în React.',
    example: 'class NetworkError extends Error {\n  constructor(public status: number, message: string) {\n    super(message);\n    this.name = "NetworkError";\n  }\n}\n\nasync function fetchData() {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new NetworkError(res.status, "HTTP error");\n    return await res.json();\n  } catch (e) {\n    if (e instanceof NetworkError) console.error("Network:", e.status);\n    else throw e;\n  } finally {\n    cleanup();\n  }\n}',
    related: ['async_await', 'promise'],
  },
  event_delegation: {
    id: 'event_delegation',
    label: 'Event Delegation',
    category: 'javascript',
    description: 'Atașează un singur listener pe părintele comun în loc de fiecare child. Eficient pentru liste dinamice. Folosește event.target.',
    example: 'document.getElementById("list").addEventListener("click", (e) => {\n  if (e.target.matches("li")) {\n    console.log("Item clicked:", e.target.textContent);\n  }\n});',
    related: ['event_loop', 'dom'],
  },
  debounce_throttle: {
    id: 'debounce_throttle',
    label: 'Debounce & Throttle',
    category: 'javascript',
    description: 'Debounce: execută DUPĂ ce s-a oprit apelarea (search, resize). Throttle: execută la intervale fixe (scroll, mouse).',
    example: 'function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {\n  let timer: NodeJS.Timeout;\n  return ((...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  }) as T;\n}\n\nconst debouncedSearch = debounce(search, 300);',
    related: ['performance', 'event_loop'],
  },
  iterators_generators: {
    id: 'iterators_generators',
    label: 'Iterators & Generators',
    category: 'javascript',
    description: 'Iterator: obiect cu .next() care returnează {value, done}. Generator: funcție cu yield care poate fi pausată/reluată.',
    example: 'function* fibonacci() {\n  let [a, b] = [0, 1];\n  while (true) {\n    yield a;\n    [a, b] = [b, a + b];\n  }\n}\n\nconst fib = fibonacci();\nfib.next().value; // 0\nfib.next().value; // 1\nfib.next().value; // 1',
    related: ['async_await', 'functie'],
  },
  proxy_reflect: {
    id: 'proxy_reflect',
    label: 'Proxy & Reflect',
    category: 'javascript',
    description: 'Proxy interceptează operații pe obiect (get, set, delete). Reflect = API standard pentru aceleași operații. Util pentru validare, logging, reactive state.',
    example: 'const handler = {\n  get(target, key) {\n    console.log(`Getting ${key}`);\n    return Reflect.get(target, key);\n  },\n  set(target, key, value) {\n    if (typeof value !== "number") throw new TypeError("Only numbers!");\n    return Reflect.set(target, key, value);\n  }\n};\nconst obj = new Proxy({}, handler);',
    related: ['prototype', 'object_methods'],
  },
  weakmap_weakset: {
    id: 'weakmap_weakset',
    label: 'WeakMap & WeakSet',
    category: 'javascript',
    description: 'Versiuni slabe ale Map/Set. Cheile nu împiedică garbage collection. Util pentru metadata privată, caching fără memory leaks.',
    example: 'const privateData = new WeakMap<object, { secret: string }>();\n\nclass MyClass {\n  constructor() {\n    privateData.set(this, { secret: "hidden" });\n  }\n  getSecret() {\n    return privateData.get(this)!.secret;\n  }\n}',
    related: ['garbage_collection', 'map_type'],
  },
  map_type: {
    id: 'map_type',
    label: 'Map & Set',
    category: 'javascript',
    description: 'Map = perechi key-value cu orice tip de cheie (vs Object = string). Set = colecție de valori unice. Ambele iterabile, păstrează ordinea inserării.',
    example: 'const map = new Map<string, number>();\nmap.set("a", 1); map.set("b", 2);\nmap.get("a"); // 1\nfor (const [key, val] of map) console.log(key, val);\n\nconst set = new Set([1, 2, 2, 3]); // {1, 2, 3}\nset.has(2); // true\nconst unique = [...new Set(array)]; // de-duplicate',
    related: ['destructuring', 'iterators_generators'],
  },
  symbol_type: {
    id: 'symbol_type',
    label: 'Symbol',
    category: 'javascript',
    description: 'Tip primitiv unic și imutabil. Util pentru chei private, protocoale (Symbol.iterator, Symbol.toPrimitive). Nu apare în JSON.',
    example: 'const id = Symbol("id");\nconst user = { [id]: 123, name: "Ion" };\nuser[id]; // 123 - proprietate "privată"\n\n// Symbol well-known\nclass Range {\n  [Symbol.iterator]() {\n    // face obiectul iterabil în for...of\n  }\n}',
    related: ['prototype', 'object_methods'],
  },
  logical_operators: {
    id: 'logical_operators',
    label: 'Operatori Logici ES2021',
    category: 'javascript',
    description: '??= (nullish assignment), ||= (OR assignment), &&= (AND assignment). Scurtătură pentru pattern-uri comune.',
    example: '// ??= — asignează doar dacă e null/undefined\nuser.name ??= "Anonim";\n\n// ||= — asignează dacă e falsy\nconfig.timeout ||= 3000;\n\n// &&= — asignează dacă e truthy\ncache.data &&= transform(cache.data);',
    related: ['null_undefined', 'variabila'],
  },
  template_literals: {
    id: 'template_literals',
    label: 'Template Literals & Tagged Templates',
    category: 'javascript',
    description: 'Backtick strings cu interpolare ${expr}. Tagged templates: funcție prefixată aplică transformări (styled-components, gql, sql).',
    example: 'const msg = `Salut, ${name}! Ai ${count} mesaje.`;\n\n// Tagged template\nfunction highlight(strings, ...values) {\n  return strings.reduce((acc, str, i) =>\n    acc + str + (values[i] ? `<b>${values[i]}</b>` : ""), "");\n}\nconst html = highlight`Bun venit, ${name}!`;',
    related: ['variabila', 'string_methods'],
  },
  string_methods: {
    id: 'string_methods',
    label: 'String Methods',
    category: 'javascript',
    description: 'Metode esențiale: slice, split, trim, replace, replaceAll, includes, startsWith, endsWith, padStart, padEnd, repeat, at.',
    example: '"hello world".includes("world"); // true\n"  trim me  ".trim(); // "trim me"\n"a,b,c".split(","); // ["a","b","c"]\n"abc".at(-1); // "c"\n"5".padStart(3, "0"); // "005"\n"ha".repeat(3); // "hahaha"\n"old".replace("old", "new"); // "new"',
    related: ['regex', 'variabila'],
  },
  array_methods: {
    id: 'array_methods',
    label: 'Array Methods Complete',
    category: 'javascript',
    description: 'map, filter, reduce, find, findIndex, some, every, flat, flatMap, from, of, includes, indexOf, splice, slice, concat, fill, entries, keys, values.',
    example: 'const data = [1, 2, 3, 4, 5];\ndata.find(n => n > 3); // 4\ndata.every(n => n > 0); // true\ndata.some(n => n > 4); // true\n[[1,2],[3,4]].flat(); // [1,2,3,4]\n[1,[2,[3]]].flat(Infinity); // [1,2,3]\nArray.from({length: 3}, (_, i) => i); // [0,1,2]',
    related: ['map_filter_reduce', 'functie'],
  },
  regex: {
    id: 'regex',
    label: 'Regular Expressions',
    category: 'javascript',
    description: 'Pattern matching pentru stringuri. Flags: g (global), i (case-insensitive), m (multiline), s (dotAll). Grupe de captare, lookahead.',
    example: '// Email validation\nconst emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n\n// Extract numbers\nconst nums = "a1 b2 c3".match(/\\d+/g); // ["1","2","3"]\n\n// Replace cu captare\n"John Doe".replace(/(\\w+) (\\w+)/, "$2, $1"); // "Doe, John"\n\n// Named groups\nconst { year, month } = "2024-03".match(/(?<year>\\d{4})-(?<month>\\d{2})/).groups;',
    related: ['string_methods'],
  },
  json_data: {
    id: 'json_data',
    label: 'JSON & Data Serialization',
    category: 'javascript',
    description: 'JSON.parse / JSON.stringify. Replacer/reviver pentru transformări. Limitări: nu suportă undefined, functions, Symbol, circular refs.',
    example: '// Stringify cu formatare\nJSON.stringify(data, null, 2);\n\n// Reviver — parsează date automat\nconst obj = JSON.parse(str, (key, val) => {\n  if (key === "createdAt") return new Date(val);\n  return val;\n});\n\n// Deep clone\nconst clone = JSON.parse(JSON.stringify(original));',
    related: ['api', 'async_await'],
  },
  local_storage: {
    id: 'local_storage',
    label: 'Storage APIs (Web)',
    category: 'javascript',
    description: 'localStorage: persistent, max ~5MB. sessionStorage: per tab, clears on close. IndexedDB: async, large data, structured. Cookies: server-side access.',
    example: '// localStorage — sincron\nlocalStorage.setItem("key", JSON.stringify(data));\nconst data = JSON.parse(localStorage.getItem("key") ?? "null");\nlocalStorage.removeItem("key");\n\n// Util\nconst storage = {\n  get: <T>(k: string): T | null => JSON.parse(localStorage.getItem(k) ?? "null"),\n  set: (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v)),\n};',
    related: ['async_storage', 'secure_store'],
  },
  fetch_api: {
    id: 'fetch_api',
    label: 'Fetch API & HTTP Client',
    category: 'javascript',
    description: 'Browser/Node built-in HTTP client. Returnează Promise<Response>. Trebuie verificat response.ok. Axios = wrapper mai ergonomic.',
    example: 'async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {\n  const res = await fetch(url, {\n    ...options,\n    headers: { "Content-Type": "application/json", ...options?.headers },\n  });\n  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);\n  return res.json() as Promise<T>;\n}',
    related: ['async_await', 'rest_api'],
  },
  websocket: {
    id: 'websocket',
    label: 'WebSocket',
    category: 'javascript',
    description: 'Conexiune bidirecțională persistentă. Ideal pentru chat, live updates, gaming. ws:// sau wss:// (secure). Heartbeat cu ping/pong.',
    example: 'const ws = new WebSocket("wss://server.com/ws");\n\nws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", channel: "updates" }));\nws.onmessage = (e) => { const msg = JSON.parse(e.data); console.log(msg); };\nws.onerror = (e) => console.error("WS Error:", e);\nws.onclose = () => setTimeout(reconnect, 3000);',
    related: ['rest_api', 'event_loop'],
  },
  web_workers: {
    id: 'web_workers',
    label: 'Web Workers',
    category: 'javascript',
    description: 'Thread secundar fără acces la DOM. Pentru calcul CPU-intensiv fără a bloca UI-ul. Comunicare prin postMessage.',
    example: '// worker.ts\nself.onmessage = (e) => {\n  const result = heavyComputation(e.data);\n  self.postMessage(result);\n};\n\n// main.ts\nconst worker = new Worker("worker.js");\nworker.postMessage(data);\nworker.onmessage = (e) => console.log("Result:", e.data);',
    related: ['event_loop', 'performance'],
  },
  service_worker: {
    id: 'service_worker',
    label: 'Service Workers & PWA',
    category: 'javascript',
    description: 'Proxy între browser și rețea. Offline support, caching, push notifications. Baza PWA. Cache API pentru interceptarea requesturilor.',
    example: '// sw.js\nself.addEventListener("install", e => {\n  e.waitUntil(\n    caches.open("v1").then(cache => cache.addAll(["/", "/app.js"]))\n  );\n});\n\nself.addEventListener("fetch", e => {\n  e.respondWith(\n    caches.match(e.request).then(r => r ?? fetch(e.request))\n  );\n});',
    related: ['fetch_api', 'lazy_loading'],
  },
  intersection_observer: {
    id: 'intersection_observer',
    label: 'Intersection Observer',
    category: 'javascript',
    description: 'Detectează când un element intră/iese din viewport. Lazy loading images, infinite scroll, animații la scroll.',
    example: 'const observer = new IntersectionObserver(\n  (entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        entry.target.classList.add("visible");\n        observer.unobserve(entry.target);\n      }\n    });\n  },\n  { threshold: 0.1 }\n);\n\ndocument.querySelectorAll(".animate").forEach(el => observer.observe(el));',
    related: ['performance', 'lazy_loading'],
  },

  // ── TypeScript Avansat ──
  union_types: {
    id: 'union_types',
    label: 'Union & Intersection Types',
    category: 'typescript',
    description: 'Union (|): poate fi oricare din tipuri. Intersection (&): trebuie să fie toate. Narrowing cu typeof, instanceof, in.',
    example: 'type Result<T> = { ok: true; data: T } | { ok: false; error: string };\n\nfunction handle(r: Result<User>) {\n  if (r.ok) console.log(r.data); // narrowed\n  else console.error(r.error);\n}\n\ntype AdminUser = User & { role: "admin"; permissions: string[] };',
    related: ['typescript_basics', 'generics'],
  },
  mapped_types: {
    id: 'mapped_types',
    label: 'Mapped Types',
    category: 'typescript',
    description: 'Transformă tipuri existente. {[K in keyof T]: ...}. Built-in: Partial, Required, Readonly, Pick, Omit, Record.',
    example: '// Toate proprietățile optional\ntype Partial<T> = { [K in keyof T]?: T[K] };\n\n// Transforma tipuri\ntype Nullable<T> = { [K in keyof T]: T[K] | null };\ntype Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };\n\n// Conditional\ntype NonNullable<T> = T extends null | undefined ? never : T;',
    related: ['generics', 'utility_types'],
  },
  utility_types: {
    id: 'utility_types',
    label: 'Utility Types TypeScript',
    category: 'typescript',
    description: 'Built-in: Partial<T>, Required<T>, Readonly<T>, Pick<T,K>, Omit<T,K>, Record<K,V>, Exclude<T,U>, Extract<T,U>, ReturnType<F>, Parameters<F>.',
    example: 'interface User { id: string; name: string; email?: string; }\n\ntype UpdateUser = Partial<Pick<User, "name" | "email">>;\ntype UserRecord = Record<string, User>;\ntype UserKeys = keyof User; // "id" | "name" | "email"\ntype Fn = (a: string) => number;\ntype FnReturn = ReturnType<Fn>; // number\ntype FnParams = Parameters<Fn>; // [string]',
    related: ['mapped_types', 'generics'],
  },
  conditional_types: {
    id: 'conditional_types',
    label: 'Conditional Types',
    category: 'typescript',
    description: 'T extends U ? X : Y. infer pentru extragere tip. Distribuție automată peste union types.',
    example: 'type IsArray<T> = T extends any[] ? true : false;\ntype UnpackArray<T> = T extends (infer U)[] ? U : T;\n\ntype UnpackPromise<T> = T extends Promise<infer U> ? U : T;\n// UnpackPromise<Promise<string>> = string\n\ntype FlattenUnion<T> = T extends { type: infer K } ? K : never;',
    related: ['mapped_types', 'generics'],
  },
  decorators: {
    id: 'decorators',
    label: 'Decorators TypeScript',
    category: 'typescript',
    description: 'Funcții care modifică clase/metode/proprietăți. Stage 3 proposal. Folosit în NestJS, Angular, MobX. @sealed, @log, @inject.',
    example: 'function log(target: any, key: string, descriptor: PropertyDescriptor) {\n  const original = descriptor.value;\n  descriptor.value = function(...args: any[]) {\n    console.log(`Calling ${key} with`, args);\n    return original.apply(this, args);\n  };\n  return descriptor;\n}\n\nclass Service {\n  @log\n  fetchData(id: string) { /* ... */ }\n}',
    related: ['clasa', 'typescript_basics'],
  },
  enums: {
    id: 'enums',
    label: 'Enums TypeScript',
    category: 'typescript',
    description: 'Set de constante numite. Numeric (default) sau String enum. Const enum = zero overhead runtime. Alternativă: union type string.',
    example: '// String enum — recomandat\nenum Direction { Up = "UP", Down = "DOWN", Left = "LEFT", Right = "RIGHT" }\n\n// Const enum — inlined la compilare, zero overhead\nconst enum Status { Active = "active", Inactive = "inactive" }\n\n// Alternativă modernă (mai lightweight)\nconst ROLES = ["admin", "user", "guest"] as const;\ntype Role = typeof ROLES[number]; // "admin" | "user" | "guest"',
    related: ['typescript_basics', 'union_types'],
  },
  type_guards: {
    id: 'type_guards',
    label: 'Type Guards & Narrowing',
    category: 'typescript',
    description: 'Tehnici de narrowing: typeof, instanceof, in operator, discriminated unions, user-defined type guards (is keyword).',
    example: '// User-defined type guard\nfunction isUser(obj: unknown): obj is User {\n  return typeof obj === "object" && obj !== null && "id" in obj;\n}\n\n// Discriminated union\ntype Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };\nfunction area(s: Shape) {\n  if (s.kind === "circle") return Math.PI * s.radius ** 2;\n  return s.w * s.h;\n}',
    related: ['union_types', 'typescript_basics'],
  },
  as_const: {
    id: 'as_const',
    label: 'as const & satisfies',
    category: 'typescript',
    description: 'as const: readonly literal types, îngustează tipul la maxim. satisfies: verifică tipul fără a-l lărgi.',
    example: 'const config = {\n  endpoint: "https://api.example.com",\n  timeout: 5000,\n} as const;\n// config.endpoint: "https://api.example.com" (nu string)\n\nconst palette = {\n  red: [255, 0, 0],\n  green: "#00ff00",\n} satisfies Record<string, string | number[]>;\n// Tipul rămâne specific, dar verificat',
    related: ['typescript_basics', 'utility_types'],
  },
  never_type: {
    id: 'never_type',
    label: 'never & unknown',
    category: 'typescript',
    description: 'never: tip imposibil, bottom type. unknown: tip sigur (spre deosebire de any), trebuie narrowat înainte de folosire. Exhaustive checks.',
    example: '// Exhaustive check\nfunction assertNever(x: never): never {\n  throw new Error("Unexpected: " + x);\n}\n\ntype Action = "start" | "stop";\nfunction handle(a: Action) {\n  if (a === "start") return;\n  if (a === "stop") return;\n  assertNever(a); // Eroare dacă adaugi o acțiune nouă fără handler\n}\n\n// unknown vs any\nfunction safeLog(x: unknown) {\n  if (typeof x === "string") console.log(x.toUpperCase());\n}',
    related: ['typescript_basics', 'type_guards'],
  },
  overloads: {
    id: 'overloads',
    label: 'Function Overloads',
    category: 'typescript',
    description: 'Definiri multiple pentru aceeași funcție cu semnături diferite. TypeScript le verifică la compile time.',
    example: 'function process(x: string): string;\nfunction process(x: number): number;\nfunction process(x: string | number): string | number {\n  if (typeof x === "string") return x.toUpperCase();\n  return x * 2;\n}\n\nprocess("hello"); // string\nprocess(42); // number',
    related: ['typescript_basics', 'generics'],
  },

  // ── React Avansat ──
  custom_hooks: {
    id: 'custom_hooks',
    label: 'Custom Hooks',
    category: 'react',
    description: 'Extrage logică reutilizabilă din componente. Convenstie: prefix "use". Pot folosi orice alt hook.',
    example: 'function useLocalStorage<T>(key: string, initial: T) {\n  const [value, setValue] = useState<T>(() => {\n    const stored = localStorage.getItem(key);\n    return stored ? JSON.parse(stored) : initial;\n  });\n\n  const set = useCallback((v: T) => {\n    setValue(v);\n    localStorage.setItem(key, JSON.stringify(v));\n  }, [key]);\n\n  return [value, set] as const;\n}',
    related: ['hooks', 'usestate', 'usecallback'],
  },
  error_boundary: {
    id: 'error_boundary',
    label: 'Error Boundary',
    category: 'react',
    description: 'Componente class care prinde erori din subtree. getDerivedStateFromError + componentDidCatch. react-error-boundary library = varianta modernă.',
    example: 'import { ErrorBoundary } from "react-error-boundary";\n\n<ErrorBoundary\n  fallback={<Text>Ceva a mers greșit!</Text>}\n  onError={(error, info) => logError(error)}\n  onReset={() => resetApp()}\n>\n  <MyComponent />\n</ErrorBoundary>',
    related: ['hooks', 'useeffect'],
  },
  suspense_react: {
    id: 'suspense_react',
    label: 'Suspense & Concurrent Features',
    category: 'react',
    description: 'Suspense: afișează fallback cât timp componentele/datele se încarcă. useTransition: marchează update-uri ca non-urgente. useDeferredValue.',
    example: 'import { Suspense, useTransition } from "react";\n\nconst [isPending, startTransition] = useTransition();\n\n// Navigare fără blocaj UI\nstartTransition(() => {\n  setCurrentTab(newTab);\n});\n\n<Suspense fallback={<Spinner />}>\n  <DataComponent /> {/* poate suspend */}\n</Suspense>',
    related: ['hooks', 'lazy_loading'],
  },
  forward_ref: {
    id: 'forward_ref',
    label: 'forwardRef & useImperativeHandle',
    category: 'react',
    description: 'forwardRef: pasează ref la componente child. useImperativeHandle: expune API personalizat la ref. Util pentru input-uri custom, scrollTo.',
    example: 'const Input = forwardRef<TextInput, InputProps>((props, ref) => {\n  return <TextInput ref={ref} {...props} />;\n});\n\n// useImperativeHandle\nconst Modal = forwardRef((props, ref) => {\n  const [visible, setVisible] = useState(false);\n  useImperativeHandle(ref, () => ({\n    open: () => setVisible(true),\n    close: () => setVisible(false),\n  }));\n  return <View>{visible && props.children}</View>;\n});',
    related: ['useref', 'hooks'],
  },
  react_memo: {
    id: 'react_memo',
    label: 'React.memo & Performance',
    category: 'react',
    description: 'React.memo: skip re-render dacă props nu s-au schimbat. Combina cu useMemo + useCallback pentru maximum effect.',
    example: '// Fără React.memo — re-render la fiecare render al părintelui\n// Cu React.memo — re-render doar când props se schimbă\nconst ExpensiveList = React.memo(({ items, onPress }: Props) => {\n  return (\n    <FlatList\n      data={items}\n      renderItem={({ item }) => <ListItem item={item} onPress={onPress} />}\n    />\n  );\n}, (prev, next) => prev.items === next.items); // custom comparator',
    related: ['memoizare', 'usememo', 'usecallback'],
  },
  higher_order_components: {
    id: 'higher_order_components',
    label: 'Higher Order Components (HOC)',
    category: 'react',
    description: 'Funcție care primește o componentă și returnează una nouă cu funcționalitate adăugată. Pattern mai vechi, înlocuit de hooks.',
    example: 'function withAuth<P extends object>(Component: React.ComponentType<P>) {\n  return function WithAuthComponent(props: P) {\n    const { user } = useAuth();\n    if (!user) return <Redirect to="/login" />;\n    return <Component {...props} />;\n  };\n}\n\nconst ProtectedProfile = withAuth(ProfileScreen);',
    related: ['hooks', 'custom_hooks'],
  },
  react_portals: {
    id: 'react_portals',
    label: 'React Portals',
    category: 'react',
    description: 'Renderează componente în alt nod DOM, afara ierarhiei normale. Util pentru modals, tooltips, dropdowns. createPortal(children, container).',
    example: 'import { createPortal } from "react-dom";\n\nfunction Modal({ children, onClose }) {\n  return createPortal(\n    <div className="modal-overlay" onClick={onClose}>\n      <div className="modal-content" onClick={e => e.stopPropagation()}>\n        {children}\n      </div>\n    </div>,\n    document.getElementById("modal-root")!\n  );\n}',
    related: ['hooks', 'useref'],
  },
  react_query: {
    id: 'react_query',
    label: 'React Query / TanStack Query',
    category: 'react',
    description: 'Server state management. Caching, background refresh, optimistic updates, pagination. useQuery, useMutation, useInfiniteQuery.',
    example: 'const { data, isLoading, error } = useQuery({\n  queryKey: ["users", userId],\n  queryFn: () => fetchUser(userId),\n  staleTime: 5 * 60 * 1000, // 5 min\n});\n\nconst mutation = useMutation({\n  mutationFn: updateUser,\n  onSuccess: () => {\n    queryClient.invalidateQueries({ queryKey: ["users"] });\n  },\n});',
    related: ['custom_hooks', 'async_await'],
  },
  zustand_advanced: {
    id: 'zustand_advanced',
    label: 'Zustand Avansat',
    category: 'state-management',
    description: 'Persist middleware, devtools, immer, slices pattern. Selectori pentru performanță. Subscripții externe.',
    example: 'import { create } from "zustand";\nimport { persist, devtools } from "zustand/middleware";\nimport { immer } from "zustand/middleware/immer";\n\nconst useStore = create<State>()(devtools(persist(immer((set) => ({\n  users: [],\n  addUser: (user) => set(state => { state.users.push(user); }),\n})), { name: "app-store" })));',
    related: ['zustand', 'redux'],
  },

  // ── React Native Avansat ──
  flatlist: {
    id: 'flatlist',
    label: 'FlatList & VirtualizedList',
    category: 'react-native',
    description: 'Lista performantă pentru date mari. Renderează doar elementele vizibile (windowing). keyExtractor, getItemLayout pentru viteză maximă.',
    example: '<FlatList\n  data={items}\n  keyExtractor={item => item.id}\n  renderItem={({ item, index }) => <ItemRow item={item} />}\n  getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}\n  initialNumToRender={15}\n  maxToRenderPerBatch={10}\n  windowSize={10}\n  removeClippedSubviews\n  onEndReached={loadMore}\n  onEndReachedThreshold={0.5}\n/>',
    related: ['react_native', 'performance'],
  },
  animated_rn: {
    id: 'animated_rn',
    label: 'Animated API (React Native)',
    category: 'react-native',
    description: 'Animații native în RN. Animated.Value, Animated.spring, Animated.timing. useNativeDriver: true pentru animații pe thread-ul nativ.',
    example: 'const opacity = useRef(new Animated.Value(0)).current;\n\nuseEffect(() => {\n  Animated.timing(opacity, {\n    toValue: 1,\n    duration: 500,\n    useNativeDriver: true, // IMPORTANT - animație pe thread nativ\n  }).start();\n}, []);\n\n<Animated.View style={{ opacity }}>\n  <Text>Fade In</Text>\n</Animated.View>',
    related: ['react_native', 'reanimated'],
  },
  reanimated: {
    id: 'reanimated',
    label: 'Reanimated 2/3',
    category: 'react-native',
    description: 'Animații 60/120fps pe UI thread. useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence. Mult mai performant decât Animated.',
    example: 'import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";\n\nconst scale = useSharedValue(1);\n\nconst animStyle = useAnimatedStyle(() => ({\n  transform: [{ scale: scale.value }],\n}));\n\nonPress={() => { scale.value = withSpring(1.2, {}, () => { scale.value = withSpring(1); }); }}',
    related: ['animated_rn', 'gesture_handler'],
  },
  gesture_handler: {
    id: 'gesture_handler',
    label: 'React Native Gesture Handler',
    category: 'react-native',
    description: 'Gesturi native: Tap, Pan, Pinch, Swipe, LongPress. Funcționează pe UI thread. Combina cu Reanimated pentru animații fluide.',
    example: 'import { GestureDetector, Gesture } from "react-native-gesture-handler";\n\nconst panGesture = Gesture.Pan()\n  .onUpdate(e => {\n    translateX.value = e.translationX;\n    translateY.value = e.translationY;\n  })\n  .onEnd(() => {\n    translateX.value = withSpring(0);\n    translateY.value = withSpring(0);\n  });\n\n<GestureDetector gesture={panGesture}>\n  <Animated.View style={animStyle} />\n</GestureDetector>',
    related: ['reanimated', 'react_native'],
  },
  navigation_rn: {
    id: 'navigation_rn',
    label: 'React Navigation',
    category: 'react-native',
    description: 'Navigare în React Native. Stack, Tab, Drawer navigators. Deep linking. Expo Router = file-based routing, mai simplu.',
    example: '// Expo Router (file-based)\n// app/(tabs)/index.tsx → tab home\n// app/user/[id].tsx → ruta dinamică\nimport { router, useLocalSearchParams } from "expo-router";\nconst { id } = useLocalSearchParams<{ id: string }>();\nrouter.push(`/user/${userId}`);\nrouter.replace("/home"); // fără back\nrouter.back(); // înapoi',
    related: ['expo', 'react_native'],
  },
  async_storage: {
    id: 'async_storage',
    label: 'AsyncStorage',
    category: 'react-native',
    description: 'Stocare key-value async în React Native. Persistă prin restartul app. Max ~6MB. Pentru date sensibile: expo-secure-store.',
    example: 'import AsyncStorage from "@react-native-async-storage/async-storage";\n\nawait AsyncStorage.setItem("@user", JSON.stringify(user));\nconst raw = await AsyncStorage.getItem("@user");\nconst user = raw ? JSON.parse(raw) : null;\nawait AsyncStorage.removeItem("@user");\nawait AsyncStorage.multiGet(["@a", "@b"]);',
    related: ['sqlite', 'secure_store'],
  },
  secure_store: {
    id: 'secure_store',
    label: 'Expo Secure Store',
    category: 'react-native',
    description: 'Stocare criptată pentru date sensibile (tokens, parole). iOS Keychain, Android Keystore. Nu apare în screenshots.',
    example: 'import * as SecureStore from "expo-secure-store";\n\nawait SecureStore.setItemAsync("api_key", apiKey);\nconst key = await SecureStore.getItemAsync("api_key");\nawait SecureStore.deleteItemAsync("api_key");\n\n// Biometric protection\nawait SecureStore.setItemAsync("secret", value, {\n  requireAuthentication: true,\n});',
    related: ['async_storage', 'hashing'],
  },
  expo_notifications: {
    id: 'expo_notifications',
    label: 'Expo Notifications',
    category: 'react-native',
    description: 'Push & local notifications. Cere permisiune, obține token Expo Push Token, trimite notificări via Expo Push API sau Firebase.',
    example: 'import * as Notifications from "expo-notifications";\n\nconst { status } = await Notifications.requestPermissionsAsync();\nconst token = await Notifications.getExpoPushTokenAsync();\n\n// Local notification\nawait Notifications.scheduleNotificationAsync({\n  content: { title: "Reminder", body: "Nu uita de azi!" },\n  trigger: { seconds: 60 },\n});',
    related: ['expo', 'react_native'],
  },
  expo_camera_api: {
    id: 'expo_camera_api',
    label: 'Expo Camera & Image Picker',
    category: 'react-native',
    description: 'expo-camera: acces la cameră, foto/video, barcode scanning. expo-image-picker: selectare din galerie sau cameră.',
    example: 'import * as ImagePicker from "expo-image-picker";\n\nconst pick = async () => {\n  const result = await ImagePicker.launchImageLibraryAsync({\n    mediaTypes: ImagePicker.MediaTypeOptions.Images,\n    allowsEditing: true,\n    aspect: [4, 3],\n    quality: 0.8,\n  });\n  if (!result.canceled) {\n    setImage(result.assets[0].uri);\n  }\n};',
    related: ['expo', 'permissions'],
  },
  expo_location: {
    id: 'expo_location',
    label: 'Expo Location & Maps',
    category: 'react-native',
    description: 'expo-location: GPS, geocoding, watch position. react-native-maps: MapView cu markers, polylines, heatmaps.',
    example: 'import * as Location from "expo-location";\n\nconst { status } = await Location.requestForegroundPermissionsAsync();\nif (status !== "granted") return;\n\nconst pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });\nconsole.log(pos.coords.latitude, pos.coords.longitude);\n\n// Watch\nconst sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High }, pos => setLocation(pos));',
    related: ['expo', 'permissions'],
  },
  permissions: {
    id: 'permissions',
    label: 'Permissions în React Native',
    category: 'react-native',
    description: 'Cere întotdeauna permisiuni la runtime. Verifică status înainte de request. Pattern: request → check → handle denied.',
    example: 'import { PermissionsAndroid } from "react-native";\n\nasync function requestCamera() {\n  if (Platform.OS === "android") {\n    const granted = await PermissionsAndroid.request(\n      PermissionsAndroid.PERMISSIONS.CAMERA\n    );\n    return granted === PermissionsAndroid.RESULTS.GRANTED;\n  }\n  return true; // iOS: configurat în app.json\n}',
    related: ['expo_camera_api', 'expo_location'],
  },
  deep_linking: {
    id: 'deep_linking',
    label: 'Deep Linking',
    category: 'react-native',
    description: 'Deschide app la o rută specifică via URL. myapp://home, https://myapp.com/products/123. Universal links = URL web care deschide app.',
    example: '// expo-router: configurare în app.json\n// "scheme": "myapp"\n// Orice link myapp:// deschide app\n\n// Exemplu: myapp://product/123\n// Se mapează pe app/product/[id].tsx\n\nimport { Linking } from "react-native";\nconst url = await Linking.getInitialURL();\nLinking.addEventListener("url", ({ url }) => handleUrl(url));',
    related: ['navigation_rn', 'expo'],
  },
  app_state: {
    id: 'app_state',
    label: 'AppState & Keyboard',
    category: 'react-native',
    description: 'AppState: active, background, inactive. Keyboard: height, show/hide events. Platform: OS-specific code.',
    example: 'import { AppState, Keyboard, Platform } from "react-native";\n\nAppState.addEventListener("change", state => {\n  if (state === "background") saveDraft();\n  if (state === "active") syncData();\n});\n\nconst kbHeight = useRef(0);\nuseEffect(() => {\n  const s = Keyboard.addListener("keyboardDidShow", e => {\n    kbHeight.current = e.endCoordinates.height;\n  });\n  return () => s.remove();\n}, []);',
    related: ['react_native', 'hooks'],
  },
  dimensions: {
    id: 'dimensions',
    label: 'Dimensions & SafeArea',
    category: 'react-native',
    description: 'Dimensions: dimensiunile ecranului. useWindowDimensions: hook reactiv. SafeAreaView: evită notch/statusbar/homeIndicator.',
    example: 'import { useWindowDimensions } from "react-native";\nimport { SafeAreaView } from "react-native-safe-area-context";\n\nconst { width, height } = useWindowDimensions(); // reactiv\nconst isTablet = width > 768;\n\nexport default function Screen() {\n  return (\n    <SafeAreaView style={{ flex: 1 }}>\n      {/* conținut sigur */}\n    </SafeAreaView>\n  );\n}',
    related: ['react_native', 'flexbox'],
  },

  // ── Backend / Node.js ──
  nodejs: {
    id: 'nodejs',
    label: 'Node.js Runtime',
    category: 'backend',
    description: 'Runtime JS pe server. Event-driven, non-blocking I/O. V8 engine + libuv. Single thread dar async prin event loop.',
    example: 'const http = require("http");\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  res.end("Hello World!");\n});\nserver.listen(3000);\n\n// Env variables\nconst PORT = process.env.PORT ?? 3000;\nconst isDev = process.env.NODE_ENV === "development";',
    related: ['express', 'event_loop'],
  },
  cors: {
    id: 'cors',
    label: 'CORS',
    category: 'backend',
    description: 'Cross-Origin Resource Sharing. Browser blochează requesturi între origini diferite. Serverul trebuie să specifice care origini sunt permise.',
    example: 'import cors from "cors";\n\napp.use(cors({\n  origin: ["https://myapp.com", "http://localhost:3000"],\n  methods: ["GET", "POST", "PUT", "DELETE"],\n  allowedHeaders: ["Content-Type", "Authorization"],\n  credentials: true, // pentru cookies\n}));\n\n// Sau dinamic\napp.use(cors({ origin: (origin, cb) => cb(null, allowedOrigins.includes(origin)) }));',
    related: ['rest_api', 'securitate'],
  },
  rate_limiting: {
    id: 'rate_limiting',
    label: 'Rate Limiting',
    category: 'backend',
    description: 'Limitează numărul de requesturi per IP/user într-o perioadă. Protecție DDoS, brute force. express-rate-limit + Redis pentru distributed.',
    example: 'import rateLimit from "express-rate-limit";\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minute\n  max: 100, // max 100 requesturi per IP\n  message: { error: "Prea multe requesturi, încearcă mai târziu." },\n  standardHeaders: true,\n});\n\napp.use("/api/", limiter);\n\n// Limiter mai strict pentru auth\nconst authLimiter = rateLimit({ windowMs: 60000, max: 5 });\napp.use("/api/auth/", authLimiter);',
    related: ['express', 'securitate'],
  },
  caching_redis: {
    id: 'caching_redis',
    label: 'Caching cu Redis',
    category: 'backend',
    description: 'In-memory caching pentru reducerea load-ului pe DB. Cache-aside pattern: check cache → miss → DB → save cache. TTL pentru expirare.',
    example: 'import { createClient } from "redis";\nconst redis = createClient({ url: process.env.REDIS_URL });\n\nasync function getCached<T>(key: string, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {\n  const cached = await redis.get(key);\n  if (cached) return JSON.parse(cached);\n  \n  const data = await fetchFn();\n  await redis.setEx(key, ttl, JSON.stringify(data));\n  return data;\n}',
    related: ['nodejs', 'performance'],
  },
  env_variables: {
    id: 'env_variables',
    label: 'Environment Variables',
    category: 'backend',
    description: 'Configurare prin env vars în loc de hardcoding. .env (local), .env.production. Secretele NICIODATĂ în git. dotenv pentru încărcare.',
    example: '// .env\nDATABASE_URL=postgresql://user:pass@localhost/db\nJWT_SECRET=supersecretkey\nPORT=3000\n\n// TypeScript\nconst config = {\n  db: process.env.DATABASE_URL!,\n  port: parseInt(process.env.PORT ?? "3000"),\n  jwtSecret: process.env.JWT_SECRET!,\n} as const;\n\n// Validare la startup\nif (!config.jwtSecret) throw new Error("JWT_SECRET not set!");',
    related: ['securitate', 'nodejs'],
  },
  websocket_server: {
    id: 'websocket_server',
    label: 'WebSocket Server (Node.js)',
    category: 'backend',
    description: 'Socket.IO = WebSocket cu fallback și rooms. ws = WebSocket pur, mai lightweight. Real-time: chat, notifications, colaborare.',
    example: 'import { Server } from "socket.io";\nimport { createServer } from "http";\n\nconst httpServer = createServer(app);\nconst io = new Server(httpServer, { cors: { origin: "*" } });\n\nio.on("connection", (socket) => {\n  socket.join("room1");\n  socket.on("message", (data) => {\n    io.to("room1").emit("message", { ...data, from: socket.id });\n  });\n  socket.on("disconnect", () => console.log("Disconnected:", socket.id));\n});',
    related: ['nodejs', 'websocket'],
  },
  streaming: {
    id: 'streaming',
    label: 'Streams Node.js',
    category: 'backend',
    description: 'Procesează date incremental fără a încărca totul în memorie. Readable, Writable, Transform, Duplex. Pipe pentru lanțuri.',
    example: 'import { createReadStream, createWriteStream } from "fs";\nimport { createGzip } from "zlib";\nimport { pipeline } from "stream/promises";\n\n// Comprimă fișier în streaming\nawait pipeline(\n  createReadStream("input.txt"),\n  createGzip(),\n  createWriteStream("output.txt.gz")\n);\n\n// HTTP streaming\napp.get("/large-file", (req, res) => {\n  createReadStream("bigfile.csv").pipe(res);\n});',
    related: ['nodejs', 'file_system_node'],
  },
  file_system_node: {
    id: 'file_system_node',
    label: 'File System (Node.js)',
    category: 'backend',
    description: 'fs module pentru operații pe fișiere. fs/promises pentru async. Pathuri cu path.join pentru cross-platform.',
    example: 'import { readFile, writeFile, mkdir, readdir } from "fs/promises";\nimport { join } from "path";\n\nconst data = await readFile(join(__dirname, "data.json"), "utf8");\nconst parsed = JSON.parse(data);\n\nawait mkdir("./output", { recursive: true });\nawait writeFile("./output/result.json", JSON.stringify(parsed, null, 2));\n\nconst files = await readdir("./src");\nconsole.log(files);',
    related: ['nodejs', 'streaming'],
  },
  validation_zod: {
    id: 'validation_zod',
    label: 'Validare cu Zod',
    category: 'backend',
    description: 'Schema validation TypeScript-first. Parse = validează + transformă. Safejson-parse fără crash. Integrat cu React Hook Form.',
    example: 'import { z } from "zod";\n\nconst UserSchema = z.object({\n  name: z.string().min(2).max(100),\n  email: z.string().email(),\n  age: z.number().int().min(0).max(150).optional(),\n  role: z.enum(["admin", "user"]).default("user"),\n});\n\ntype User = z.infer<typeof UserSchema>;\n\n// Validare\nconst result = UserSchema.safeParse(req.body);\nif (!result.success) return res.status(400).json(result.error.flatten());',
    related: ['typescript_basics', 'middleware'],
  },

  // ── Baze de Date ──
  postgresql: {
    id: 'postgresql',
    label: 'PostgreSQL',
    category: 'database',
    description: 'RDBMS open-source cel mai avansat. JSONB, array types, full-text search, PostGIS, pg_vector. ACID complet, concurență excelentă.',
    example: '-- JSONB\nSELECT data->>"name" FROM users WHERE data @> \'{"active": true}\';\n\n-- CTE (Common Table Expression)\nWITH active_users AS (\n  SELECT * FROM users WHERE status = "active"\n)\nSELECT u.name, COUNT(o.id) FROM active_users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.name;\n\n-- Full-text search\nSELECT * FROM articles\nWHERE to_tsvector("romanian", content) @@ plainto_tsquery("romanian", $1);',
    related: ['sql', 'drizzle_orm'],
  },
  drizzle_orm: {
    id: 'drizzle_orm',
    label: 'Drizzle ORM',
    category: 'database',
    description: 'ORM TypeScript-first, lightweight. Schema = cod TypeScript. Queries type-safe. Migrations auto-generate. Suportă PostgreSQL, MySQL, SQLite.',
    example: 'import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";\n\nexport const users = pgTable("users", {\n  id: text("id").primaryKey().default(sql`gen_random_uuid()`),\n  name: text("name").notNull(),\n  email: text("email").unique().notNull(),\n  createdAt: timestamp("created_at").defaultNow(),\n});\n\n// Query\nconst result = await db.select().from(users).where(eq(users.email, email)).limit(1);',
    related: ['postgresql', 'sql'],
  },
  prisma_orm: {
    id: 'prisma_orm',
    label: 'Prisma ORM',
    category: 'database',
    description: 'ORM popular pentru Node.js. Schema DSL propriu, migrations, Prisma Studio. Generat TypeScript client. Suportă PostgreSQL, MongoDB, SQLite.',
    example: '// schema.prisma\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  name      String?\n  posts     Post[]\n  createdAt DateTime @default(now())\n}\n\n// Query\nconst user = await prisma.user.findUnique({\n  where: { email },\n  include: { posts: { take: 5, orderBy: { createdAt: "desc" } } },\n});',
    related: ['postgresql', 'sql'],
  },
  transactions: {
    id: 'transactions',
    label: 'Tranzacții DB',
    category: 'database',
    description: 'ACID: Atomicity, Consistency, Isolation, Durability. BEGIN/COMMIT/ROLLBACK. Izolarea previne dirty reads, phantom reads.',
    example: '-- SQL raw\nBEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = $1;\nUPDATE accounts SET balance = balance + 100 WHERE id = $2;\nCOMMIT;\n\n// Drizzle ORM\nawait db.transaction(async (tx) => {\n  await tx.update(accounts).set({ balance: sql`balance - 100` }).where(eq(accounts.id, fromId));\n  await tx.update(accounts).set({ balance: sql`balance + 100` }).where(eq(accounts.id, toId));\n});',
    related: ['postgresql', 'sql'],
  },
  indexes: {
    id: 'indexes',
    label: 'Indexuri DB',
    category: 'database',
    description: 'Accelerează SELECT dar încetinesc INSERT/UPDATE. B-tree (default), Hash, GIN (full-text, JSONB), GiST (geo). EXPLAIN ANALYZE pentru debugging.',
    example: '-- Index simplu\nCREATE INDEX idx_users_email ON users(email);\n\n-- Index compus (ordinea contează)\nCREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);\n\n-- Index parțial\nCREATE INDEX idx_active_users ON users(email) WHERE is_active = true;\n\n-- GIN pentru full-text\nCREATE INDEX idx_articles_search ON articles USING GIN(to_tsvector("english", content));',
    related: ['postgresql', 'sql'],
  },
  migrations: {
    id: 'migrations',
    label: 'Migrations DB',
    category: 'database',
    description: 'Schimbări de schemă versionizate. Up (apply) + Down (rollback). Drizzle: generate → push. Prisma: migrate dev. Niciodată edita tabele direct în prod.',
    example: '// Drizzle Kit\n// 1. Modifică schema.ts\n// 2. npx drizzle-kit generate — creează migration SQL\n// 3. npx drizzle-kit push — aplică în DB\n\n// Prisma\n// 1. Modifică schema.prisma\n// 2. npx prisma migrate dev --name add_user_role\n// 3. npx prisma generate — regenerează clientul',
    related: ['drizzle_orm', 'prisma_orm'],
  },

  // ── Testing ──
  jest_testing: {
    id: 'jest_testing',
    label: 'Jest - Framework de Testing',
    category: 'testing',
    description: 'Framework JS/TS de testare. describe, it/test, expect, beforeEach, afterAll. Mocking, snapshots, coverage. Built-in cu CRA, Next.js.',
    example: 'describe("UserService", () => {\n  let service: UserService;\n  beforeEach(() => { service = new UserService(mockDB); });\n  \n  it("creates user with hashed password", async () => {\n    const user = await service.create({ email: "a@b.com", password: "pass" });\n    expect(user.id).toBeDefined();\n    expect(user.password).not.toBe("pass"); // hash\n    expect(user.email).toBe("a@b.com");\n  });\n  \n  it("throws on duplicate email", async () => {\n    await expect(service.create(existing)).rejects.toThrow("Email already exists");\n  });\n});',
    related: ['tdd', 'mocking'],
  },
  mocking: {
    id: 'mocking',
    label: 'Mocking în Tests',
    category: 'testing',
    description: 'Mock-urile înlocuiesc dependențe externe în tests. jest.mock(), jest.spyOn(), jest.fn(). MSW (Mock Service Worker) pentru API mocking.',
    example: '// Mock modul\njest.mock("../database", () => ({\n  findUser: jest.fn().mockResolvedValue({ id: "1", name: "Ion" }),\n  saveUser: jest.fn().mockResolvedValue(undefined),\n}));\n\n// Spy\nconst consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});\nafter(() => consoleSpy.mockRestore();\n\n// Assert\nexpect(mockDB.saveUser).toHaveBeenCalledWith(expect.objectContaining({ email: "a@b.com" }));',
    related: ['jest_testing', 'tdd'],
  },
  tdd: {
    id: 'tdd',
    label: 'TDD & BDD',
    category: 'testing',
    description: 'TDD: Red (test eșuat) → Green (minim cod) → Refactor. BDD: comportament descris în limbaj natural (Gherkin). Avantaj: design mai bun.',
    example: '// TDD: scrie testul ÎNAINTE de implementare\nit("calculates correct tax", () => {\n  expect(calculateTax(100, 0.2)).toBe(20); // FAIL\n});\n\n// Acum implementează\nfunction calculateTax(amount: number, rate: number): number {\n  return amount * rate; // PASS\n}\n\n// BDD - Gherkin style\n// Given a product costs 100\n// When user applies 20% discount\n// Then price should be 80',
    related: ['jest_testing', 'mocking'],
  },
  e2e_testing: {
    id: 'e2e_testing',
    label: 'E2E Testing (Playwright/Cypress)',
    category: 'testing',
    description: 'Testează flow-uri complete ca un utilizator real. Playwright = mai rapid, cross-browser. Cypress = developer experience mai bun, mai vechi.',
    example: '// Playwright\nimport { test, expect } from "@playwright/test";\n\ntest("user can login and see dashboard", async ({ page }) => {\n  await page.goto("/login");\n  await page.fill("[name=email]", "user@test.com");\n  await page.fill("[name=password]", "password");\n  await page.click("button[type=submit]");\n  await expect(page).toHaveURL("/dashboard");\n  await expect(page.getByText("Bun venit")).toBeVisible();\n});',
    related: ['jest_testing', 'tdd'],
  },

  // ── DevOps & Deployment ──
  docker: {
    id: 'docker',
    label: 'Docker & Containere',
    category: 'devops',
    description: 'Containerizare aplicații. Dockerfile = instrucțiuni build. docker-compose = multi-container. Izolat, reproductibil, portable.',
    example: '# Dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "dist/index.js"]\n\n# .dockerignore\nnode_modules\ndist\n.env\n\n# docker-compose.yml\nservices:\n  app:\n    build: .\n    ports: ["3000:3000"]\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret',
    related: ['devops', 'ci_cd'],
  },
  ci_cd: {
    id: 'ci_cd',
    label: 'CI/CD Pipeline',
    category: 'devops',
    description: 'Continuous Integration: build + test automat la fiecare commit. Continuous Deployment: deploy automat în producție după CI. GitHub Actions, GitLab CI.',
    example: '# .github/workflows/deploy.yml\nname: Deploy\non:\n  push:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm test\n      - run: npm run build\n  deploy:\n    needs: test\n    steps:\n      - run: npm run deploy',
    related: ['docker', 'git'],
  },
  nginx: {
    id: 'nginx',
    label: 'Nginx - Web Server/Proxy',
    category: 'devops',
    description: 'High-performance web server și reverse proxy. Servește fișiere statice, proxy la Node.js, SSL termination, load balancing, rate limiting.',
    example: 'server {\n  listen 443 ssl;\n  server_name myapp.com;\n  \n  ssl_certificate /etc/letsencrypt/live/myapp.com/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;\n  \n  location /api/ {\n    proxy_pass http://localhost:3000;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  \n  location / {\n    root /var/www/html;\n    try_files $uri $uri/ /index.html;\n  }\n}',
    related: ['devops', 'cors'],
  },
  monitoring: {
    id: 'monitoring',
    label: 'Monitoring & Logging',
    category: 'devops',
    description: 'Logging structurat (JSON). Sentry/Datadog pentru error tracking. Prometheus + Grafana pentru metrics. Health check endpoints. Alerting.',
    example: 'import winston from "winston";\n\nconst logger = winston.createLogger({\n  format: winston.format.combine(\n    winston.format.timestamp(),\n    winston.format.json()\n  ),\n  transports: [new winston.transports.File({ filename: "error.log", level: "error" })],\n});\n\n// Health check\napp.get("/health", (req, res) => {\n  res.json({ status: "ok", uptime: process.uptime(), memory: process.memoryUsage() });\n});',
    related: ['nodejs', 'devops'],
  },

  // ── Securitate ──
  owasp: {
    id: 'owasp',
    label: 'OWASP Top 10',
    category: 'securitate',
    description: 'Cele mai comune vulnerabilități web: Injection, Broken Auth, XSS, IDOR, Security Misconfiguration, Outdated Deps, CSRF, SSRF.',
    example: '// Prevenție injection — parametrizare\nawait db.query("SELECT * FROM users WHERE email = $1", [email]); // SAFE\n// NU: `SELECT * FROM users WHERE email = "${email}"` // INJECTION RISK\n\n// Prevenție XSS — sanitizare output\nimport DOMPurify from "dompurify";\nconst safe = DOMPurify.sanitize(userInput);\n\n// Prevenție CSRF — SameSite cookie\nres.cookie("session", token, { httpOnly: true, secure: true, sameSite: "strict" });',
    related: ['auth_jwt', 'hashing', 'securitate'],
  },
  input_validation: {
    id: 'input_validation',
    label: 'Validare & Sanitizare Input',
    category: 'securitate',
    description: 'NICIODATĂ nu ai încredere în input de la client. Validează tipul, formatul, lungimea. Sanitizează pentru output. Whitelist > blacklist.',
    example: 'import { z } from "zod";\nimport { escape } from "validator";\n\nconst schema = z.object({\n  name: z.string().min(1).max(100).transform(escape),\n  email: z.string().email().toLowerCase(),\n  age: z.number().int().min(0).max(150),\n});\n\n// Middleware de validare\nconst validate = (schema: z.ZodType) => (req, res, next) => {\n  const result = schema.safeParse(req.body);\n  if (!result.success) return res.status(400).json(result.error);\n  req.body = result.data;\n  next();\n};',
    related: ['owasp', 'validation_zod'],
  },
  helmet: {
    id: 'helmet',
    label: 'Helmet.js (Security Headers)',
    category: 'securitate',
    description: 'Setează HTTP security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options. Protecție împotriva atacurilor comune.',
    example: 'import helmet from "helmet";\n\napp.use(helmet()); // Default headers\n\n// Personalizat\napp.use(helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: ["\'self\'"],\n    scriptSrc: ["\'self\'", "\'nonce-abc123\'"],\n    imgSrc: ["\'self\'", "data:", "https://cdn.example.com"],\n    connectSrc: ["\'self\'", "https://api.example.com"],\n  },\n}));',
    related: ['owasp', 'cors'],
  },

  // ── Algoritmi Avansați ──
  binary_search: {
    id: 'binary_search',
    label: 'Binary Search',
    category: 'algoritmi',
    description: 'Căutare în array sortat. Divide la jumătate la fiecare pas. O(log n). Variante: lower_bound, upper_bound.',
    example: 'function binarySearch(arr: number[], target: number): number {\n  let left = 0, right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = (left + right) >>> 1; // bit shift = Math.floor((l+r)/2)\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
    related: ['big_o', 'sortare'],
  },
  dynamic_programming: {
    id: 'dynamic_programming',
    label: 'Dynamic Programming',
    category: 'algoritmi',
    description: 'Descompune problema în subprobleme suprapuse. Memoizare (top-down) sau tabulation (bottom-up). Fibonacci, Knapsack, LCS.',
    example: '// Longest Common Subsequence\nfunction lcs(s1: string, s2: string): number {\n  const dp = Array.from({length: s1.length + 1}, () => new Array(s2.length + 1).fill(0));\n  for (let i = 1; i <= s1.length; i++)\n    for (let j = 1; j <= s2.length; j++)\n      dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);\n  return dp[s1.length][s2.length];\n}',
    related: ['recursivitate', 'big_o'],
  },
  graph_algorithms: {
    id: 'graph_algorithms',
    label: 'BFS & DFS pe Grafuri',
    category: 'algoritmi',
    description: 'BFS (coadă): cel mai scurt drum în grafuri neponderate. DFS (stivă/recursiv): exploatare adâncă, detectare cicluri.',
    example: '// BFS\nfunction bfs(graph: Map<number, number[]>, start: number): number[] {\n  const visited = new Set([start]);\n  const queue = [start];\n  const result: number[] = [];\n  while (queue.length) {\n    const node = queue.shift()!;\n    result.push(node);\n    for (const neighbor of graph.get(node) ?? [])\n      if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }\n  }\n  return result;\n}',
    related: ['big_o', 'recursivitate'],
  },
  sliding_window: {
    id: 'sliding_window',
    label: 'Sliding Window & Two Pointers',
    category: 'algoritmi',
    description: 'Sliding window: fereastră care se deplasează pe array. Two pointers: doi pointeri care se mișcă spre centru sau același sens. O(n) vs O(n²).',
    example: '// Max sum subarray de lungime k\nfunction maxSubarraySum(arr: number[], k: number): number {\n  let sum = arr.slice(0, k).reduce((a, b) => a + b, 0);\n  let max = sum;\n  for (let i = k; i < arr.length; i++) {\n    sum += arr[i] - arr[i - k];\n    max = Math.max(max, sum);\n  }\n  return max;\n}',
    related: ['big_o', 'array_methods'],
  },
  hash_table: {
    id: 'hash_table',
    label: 'Hash Table & HashMap',
    category: 'algoritmi',
    description: 'Structură O(1) get/set/delete medie. Map în JS. Coliziuni rezolvate prin chaining. Aplicații: cache, frecvențe, deduplicare.',
    example: '// Anagram check\nfunction isAnagram(s: string, t: string): boolean {\n  if (s.length !== t.length) return false;\n  const counts = new Map<string, number>();\n  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1);\n  for (const c of t) {\n    const n = counts.get(c);\n    if (!n) return false;\n    counts.set(c, n - 1);\n  }\n  return true;\n}',
    related: ['map_type', 'big_o'],
  },
  linked_list: {
    id: 'linked_list',
    label: 'Linked List',
    category: 'algoritmi',
    description: 'Nod cu valoare și pointer la următor. Singly/Doubly linked. O(1) insert/delete la început, O(n) căutare. Implementează queue, LRU cache.',
    example: 'class ListNode<T> {\n  constructor(public val: T, public next: ListNode<T> | null = null) {}\n}\n\n// Reverse linked list\nfunction reverse<T>(head: ListNode<T> | null): ListNode<T> | null {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
    related: ['big_o', 'recursivitate'],
  },
  tree_structures: {
    id: 'tree_structures',
    label: 'Binary Tree & BST',
    category: 'algoritmi',
    description: 'Binary Tree: fiecare nod max 2 copii. BST: left < root < right, O(log n). Traversal: inorder (sorted), preorder, postorder.',
    example: 'class TreeNode {\n  constructor(public val: number, public left?: TreeNode, public right?: TreeNode) {}\n}\n\n// Inorder traversal (BST → sorted)\nfunction inorder(root?: TreeNode): number[] {\n  if (!root) return [];\n  return [...inorder(root.left), root.val, ...inorder(root.right)];\n}\n\n// Max depth\nfunction maxDepth(root?: TreeNode): number {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}',
    related: ['recursivitate', 'graph_algorithms'],
  },

  // ── Design Patterns Avansate ──
  strategy: {
    id: 'strategy',
    label: 'Strategy Pattern',
    category: 'design-patterns',
    description: 'Definește familia de algoritmi interschimbabili. Clientul alege strategia la runtime. Elimină if/switch imens. Principiul Open/Closed.',
    example: 'interface SortStrategy {\n  sort(data: number[]): number[];\n}\n\nclass QuickSort implements SortStrategy {\n  sort(data: number[]) { return [...data].sort((a, b) => a - b); }\n}\n\nclass BubbleSort implements SortStrategy {\n  sort(data: number[]) { /* bubble sort */ return data; }\n}\n\nclass Sorter {\n  constructor(private strategy: SortStrategy) {}\n  setStrategy(s: SortStrategy) { this.strategy = s; }\n  sort(data: number[]) { return this.strategy.sort(data); }\n}',
    related: ['design-patterns', 'clasa'],
  },
  repository_pattern: {
    id: 'repository_pattern',
    label: 'Repository Pattern',
    category: 'design-patterns',
    description: 'Abstracție peste stratul de date. Codul de business nu știe dacă datele vin din DB, API sau cache. Testare mai ușoară cu mock repositories.',
    example: 'interface UserRepository {\n  findById(id: string): Promise<User | null>;\n  save(user: User): Promise<void>;\n  delete(id: string): Promise<void>;\n}\n\nclass PostgresUserRepository implements UserRepository {\n  async findById(id: string) {\n    return db.select().from(users).where(eq(users.id, id)).get();\n  }\n  async save(user: User) { await db.insert(users).values(user); }\n}\n\n// Test\nclass MockUserRepository implements UserRepository { /* ... */ }',
    related: ['design-patterns', 'singleton'],
  },
  dependency_injection: {
    id: 'dependency_injection',
    label: 'Dependency Injection',
    category: 'design-patterns',
    description: 'Dependențele sunt injectate în loc de create intern. Testare mai ușoară, cuplaj mai slab. IoC container în Angular/NestJS.',
    example: '// Fără DI — tight coupling\nclass OrderService {\n  private db = new PostgresDB(); // PROBLEMATIC\n}\n\n// Cu DI — loose coupling\nclass OrderService {\n  constructor(private db: Database) {} // INJECTAT\n}\n\n// Utilizare\nconst service = new OrderService(new PostgresDB()); // producție\nconst service = new OrderService(new MockDB()); // test',
    related: ['design-patterns', 'repository_pattern'],
  },
  builder_pattern: {
    id: 'builder_pattern',
    label: 'Builder Pattern',
    category: 'design-patterns',
    description: 'Construiește obiecte complexe pas cu pas. Separă construcția de reprezentare. Fluent interface (method chaining).',
    example: 'class QueryBuilder {\n  private _table = "";\n  private _conditions: string[] = [];\n  private _limit?: number;\n\n  from(table: string) { this._table = table; return this; }\n  where(cond: string) { this._conditions.push(cond); return this; }\n  limit(n: number) { this._limit = n; return this; }\n  build() {\n    let q = `SELECT * FROM ${this._table}`;\n    if (this._conditions.length) q += ` WHERE ${this._conditions.join(" AND ")}`;\n    if (this._limit) q += ` LIMIT ${this._limit}`;\n    return q;\n  }\n}\n\n// Utilizare\nconst q = new QueryBuilder().from("users").where("active = 1").limit(10).build();',
    related: ['design-patterns', 'clasa'],
  },
  event_sourcing: {
    id: 'event_sourcing',
    label: 'Event Sourcing & CQRS',
    category: 'design-patterns',
    description: 'Event Sourcing: stochează evenimente în loc de starea curentă. CQRS: comenzi separate de interogări. Audit log complet, time travel debugging.',
    example: 'type Event =\n  | { type: "UserCreated"; userId: string; email: string }\n  | { type: "UserEmailChanged"; userId: string; newEmail: string };\n\nfunction applyEvent(state: User | null, event: Event): User | null {\n  if (event.type === "UserCreated")\n    return { id: event.userId, email: event.email };\n  if (event.type === "UserEmailChanged" && state)\n    return { ...state, email: event.newEmail };\n  return state;\n}\n\n// Reconstruct state from events\nconst state = events.reduce(applyEvent, null);',
    related: ['design-patterns', 'observer'],
  },

  // ── Performance & Optimizare ──
  code_splitting: {
    id: 'code_splitting',
    label: 'Code Splitting & Tree Shaking',
    category: 'performance',
    description: 'Code splitting: bundle-uri separate pe rute. Tree shaking: elimină cod neutilizat din bundle. ESM + bundler (Vite, webpack) fac automat.',
    example: '// Code splitting cu React.lazy\nconst Settings = lazy(() => import("./SettingsScreen"));\n\n// Named exports = mai bun tree shaking\nexport function formatDate(d: Date) { /* ... */ }\nexport function parseDate(s: string) { /* ... */ }\n\n// VS default export (mai greu de tree-shake)\nexport default { formatDate, parseDate };\n\n// Dynamic import\nconst { heavyFn } = await import("./heavy-module");',
    related: ['lazy_loading', 'performance'],
  },
  virtualization: {
    id: 'virtualization',
    label: 'Virtualizare Liste',
    category: 'performance',
    description: 'Renderează doar elementele vizibile din liste mari. FlatList (RN), react-window / @tanstack/virtual (web). Esențial pentru 1000+ items.',
    example: '// React Native — FlatList cu getItemLayout\n<FlatList\n  data={thousandItems}\n  getItemLayout={(_, i) => ({ length: 70, offset: 70 * i, index: i })}\n  initialNumToRender={20}\n  windowSize={5}\n  removeClippedSubviews\n/>\n\n// Web — @tanstack/virtual\nconst rowVirtualizer = useVirtualizer({\n  count: rows.length,\n  getScrollElement: () => parentRef.current,\n  estimateSize: () => 35,\n});',
    related: ['flatlist', 'performance'],
  },
  memory_management: {
    id: 'memory_management',
    label: 'Memory Management & Leaks',
    category: 'performance',
    description: 'Memory leaks comune: event listeners neutrasă, setTimeout/Interval, subscripții. useEffect cleanup, WeakMap pentru referințe. Chrome DevTools Memory tab.',
    example: 'useEffect(() => {\n  const subscription = someObservable.subscribe(handler);\n  const timer = setInterval(tick, 1000);\n  window.addEventListener("resize", onResize);\n  \n  return () => { // CLEANUP ESENȚIAL\n    subscription.unsubscribe();\n    clearInterval(timer);\n    window.removeEventListener("resize", onResize);\n  };\n}, []);',
    related: ['performance', 'weakmap_weakset'],
  },
  bundle_optimization: {
    id: 'bundle_optimization',
    label: 'Bundle Optimization',
    category: 'performance',
    description: 'Analiză bundle cu webpack-bundle-analyzer / vite-bundle-visualizer. Minimizare, compresie gzip/brotli, CDN, immutable caching, preload/prefetch.',
    example: '// vite.config.ts\nexport default defineConfig({\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ["react", "react-dom"],\n          utils: ["date-fns", "lodash-es"],\n        },\n      },\n    },\n  },\n});\n\n// package.json — analiză bundle\n"analyze": "ANALYZE=true vite build"',
    related: ['code_splitting', 'performance'],
  },

  // ── CSS & Styling Web ──
  css_grid: {
    id: 'css_grid',
    label: 'CSS Grid',
    category: 'styling',
    description: 'Layout 2D. grid-template-columns, grid-template-rows, gap, grid-area, auto-fill/auto-fit. Ideal pentru layouts complexe.',
    example: '.layout {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\n/* Named areas */\n.page {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n  grid-template-columns: 250px 1fr;\n}',
    related: ['flexbox', 'media_queries'],
  },
  media_queries: {
    id: 'media_queries',
    label: 'Responsive Design & Media Queries',
    category: 'styling',
    description: 'Mobile-first: breakpoints min-width. Tailwind: sm: md: lg: xl:. CSS Container Queries pentru responsive pe componente.',
    example: '/* Mobile first */\n.card { width: 100%; }\n\n@media (min-width: 640px) { .card { width: 50%; } }\n@media (min-width: 1024px) { .card { width: 33.333%; } }\n\n/* Container queries */\n@container card (min-width: 400px) {\n  .card-content { flex-direction: row; }\n}\n\n/* Tailwind */\n<div class="w-full sm:w-1/2 lg:w-1/3">',
    related: ['css_grid', 'flexbox'],
  },
  css_animations: {
    id: 'css_animations',
    label: 'CSS Animations & Transitions',
    category: 'styling',
    description: 'Transitions: schimbare lină la o proprietate. Animations: keyframes multi-step. transform + opacity pe GPU (performanță). will-change.',
    example: '/* Transition */\n.btn { transition: all 0.2s ease; }\n.btn:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }\n\n/* Animation cu keyframes */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n.element { animation: fadeIn 0.5s ease forwards; }',
    related: ['css_grid', 'performance'],
  },
  tailwind: {
    id: 'tailwind',
    label: 'Tailwind CSS',
    category: 'styling',
    description: 'Utility-first CSS framework. Clase atomice direct în HTML. JIT compiler = bundle mic. Personalizare prin tailwind.config.js.',
    example: '<div class="flex items-center gap-4 p-6 bg-gray-900 rounded-xl shadow-2xl">\n  <img class="w-12 h-12 rounded-full ring-2 ring-violet-500" src={avatar} />\n  <div>\n    <h3 class="text-white font-bold text-lg">{name}</h3>\n    <p class="text-gray-400 text-sm">{email}</p>\n  </div>\n  <button class="ml-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition">\n    Urmărește\n  </button>\n</div>',
    related: ['css_grid', 'media_queries'],
  },
  stylesheet_rn: {
    id: 'stylesheet_rn',
    label: 'StyleSheet React Native',
    category: 'react-native',
    description: 'CSS-in-JS pentru RN. StyleSheet.create pentru optimizare. Nu suportă: gradients, box-shadow (doar shadow*), :hover, media queries. LinearGradient = expo-linear-gradient.',
    example: 'const styles = StyleSheet.create({\n  card: {\n    backgroundColor: "#1A1A2E",\n    borderRadius: 16,\n    padding: 16,\n    shadowColor: "#000",\n    shadowOffset: { width: 0, height: 4 },\n    shadowOpacity: 0.3,\n    shadowRadius: 8,\n    elevation: 8, // Android\n  },\n  gradient: {\n    // expo-linear-gradient\n  },\n});',
    related: ['flexbox', 'react_native'],
  },

  // ── AI & ML ──
  llm_api: {
    id: 'llm_api',
    label: 'LLM APIs (OpenAI/Gemini)',
    category: 'ai',
    description: 'API-uri pentru Large Language Models. Chat completions: messages = [{role, content}]. Temperature (creativitate), max_tokens, streaming.',
    example: 'const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n\nconst completion = await openai.chat.completions.create({\n  model: "gpt-4o",\n  messages: [\n    { role: "system", content: "Ești un asistent util." },\n    { role: "user", content: userMessage },\n  ],\n  temperature: 0.7,\n  max_tokens: 1000,\n  stream: true, // streaming\n});',
    related: ['fetch_api', 'async_await'],
  },
  embeddings: {
    id: 'embeddings',
    label: 'Embeddings & Vector Search',
    category: 'ai',
    description: 'Text → vector float de dimensiune fixă. Similitudine cosinus pentru semantic search. pgvector pentru PostgreSQL. Pinecone/Weaviate pentru vector DB.',
    example: 'const embedding = await openai.embeddings.create({\n  model: "text-embedding-3-small",\n  input: "text to embed",\n});\nconst vector = embedding.data[0].embedding; // float[1536]\n\n// pgvector query\nconst similar = await db.execute(sql`\n  SELECT id, content, 1 - (embedding <=> ${vector}::vector) AS similarity\n  FROM documents\n  ORDER BY embedding <=> ${vector}::vector\n  LIMIT 5\n`);',
    related: ['llm_api', 'postgresql'],
  },
  rag: {
    id: 'rag',
    label: 'RAG (Retrieval Augmented Generation)',
    category: 'ai',
    description: 'Combina LLM cu baza ta de cunoștințe. Embed documente → stochează → la query: embed query → caută similar → include în prompt → LLM răspunde.',
    example: '// 1. Embed și stochează documentele\nasync function indexDocument(text: string) {\n  const embedding = await getEmbedding(text);\n  await db.insert(documents).values({ content: text, embedding });\n}\n\n// 2. Răspunde la query\nasync function answerWithContext(question: string) {\n  const qEmbed = await getEmbedding(question);\n  const context = await findSimilar(qEmbed, 5);\n  return llm.complete(`Context: ${context}\\n\\nÎntrebare: ${question}`);\n}',
    related: ['embeddings', 'llm_api'],
  },
  prompt_engineering: {
    id: 'prompt_engineering',
    label: 'Prompt Engineering',
    category: 'ai',
    description: 'Tehnici: zero-shot, few-shot (exemple), chain-of-thought (pas cu pas), role prompting, output format specification. System prompt = instrucțiuni globale.',
    example: '// Few-shot example\nconst prompt = `Clasifică sentimentul:\n\nExemplu: "Produsul e excelent!" → Pozitiv\nExemplu: "Nu am primit comanda" → Negativ\nExemplu: "Produsul e OK" → Neutru\n\nTexte de clasificat:\n"${userText}" → `;\n\n// Chain-of-thought\nconst prompt2 = `Rezolvă pas cu pas: ${problem}\nPas 1: ...\nPas 2: ...\nRăspuns final: `;',
    related: ['llm_api', 'rag'],
  },

  // ── Git & Tools ──
  git_advanced: {
    id: 'git_advanced',
    label: 'Git Avansat',
    category: 'tools',
    description: 'rebase (history curat), cherry-pick (commit specific), bisect (find bug commit), stash, reflog (recuperare), hooks (pre-commit).',
    example: '# Rebase interactiv — curăță commits\ngit rebase -i HEAD~5\n\n# Cherry-pick commit specific\ngit cherry-pick abc1234\n\n# Bisect — găsește commit care a introdus bug\ngit bisect start\ngit bisect bad  # commit curent e broken\ngit bisect good v1.0  # v1.0 era bine\n\n# Stash\ngit stash push -m "WIP: feature X"\ngit stash pop',
    related: ['git', 'ci_cd'],
  },
  npm_yarn_pnpm: {
    id: 'npm_yarn_pnpm',
    label: 'Package Managers (npm/yarn/pnpm)',
    category: 'tools',
    description: 'pnpm: cel mai rapid, disk efficient cu symlinks. yarn: workspaces, PnP mode. npm: built-in Node. Lockfile = versionare exactă dependențe.',
    example: '# pnpm (recomandat pentru monorepo)\npnpm install\npnpm add react\npnpm add -D typescript\npnpm --filter @workspace/api run dev\n\n# Audit securitate\npnpm audit\n\n# package.json engines\n"engines": {\n  "node": ">=20",\n  "pnpm": ">=8"\n}',
    related: ['nodejs', 'devops'],
  },
  vite: {
    id: 'vite',
    label: 'Vite Build Tool',
    category: 'tools',
    description: 'Build tool ultra-rapid. ESM în dev (fără bundling), esbuild/rollup în prod. HMR instant. Suportă React, Vue, Svelte, TypeScript.',
    example: '// vite.config.ts\nimport { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: { "@": "/src" },\n  },\n  server: {\n    port: Number(process.env.PORT ?? 3000),\n    allowedHosts: "all", // pentru Replit\n  },\n  build: {\n    outDir: "dist",\n    sourcemap: true,\n  },\n});',
    related: ['code_splitting', 'bundle_optimization'],
  },
  typescript_config: {
    id: 'typescript_config',
    label: 'tsconfig.json Config',
    category: 'tools',
    description: 'strict: true (recomandat), target, module, paths, baseUrl, excludes, references (composite builds).',
    example: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "Bundler",\n    "strict": true,\n    "noUncheckedIndexedAccess": true,\n    "exactOptionalPropertyTypes": true,\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    },\n    "jsx": "react-native",\n    "lib": ["ES2022"]\n  },\n  "exclude": ["node_modules", "dist"]\n}',
    related: ['typescript_basics', 'vite'],
  },
  eslint_prettier: {
    id: 'eslint_prettier',
    label: 'ESLint & Prettier',
    category: 'tools',
    description: 'ESLint: detectează erori și bad practices. Prettier: formatare automată. .eslintrc + .prettierrc. Husky + lint-staged pentru pre-commit.',
    example: '// .eslintrc.js\nmodule.exports = {\n  extends: ["eslint:recommended", "@typescript-eslint/recommended"],\n  rules: {\n    "no-console": "warn",\n    "@typescript-eslint/no-explicit-any": "error",\n  },\n};\n\n// package.json\n"lint-staged": {\n  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],\n},\n"prepare": "husky install"',
    related: ['typescript_config', 'git_advanced'],
  },

  // ── Arhitectura Software ──
  clean_architecture: {
    id: 'clean_architecture',
    label: 'Clean Architecture',
    category: 'architecture',
    description: 'Separation of concerns: Entities → Use Cases → Adapters → Frameworks. Dependențele pointează spre interior. Business logic izolată.',
    example: '// Structură\nsrc/\n  domain/       # Entitati, reguli de business\n    entities/user.ts\n    usecases/createUser.ts\n  application/  # Orchestrare use cases\n    services/UserService.ts\n  infrastructure/ # DB, APIs externe\n    repositories/PostgresUserRepo.ts\n  presentation/  # Controllers, Routes\n    routes/users.ts',
    related: ['design-patterns', 'dependency_injection'],
  },
  microservices: {
    id: 'microservices',
    label: 'Microservicii vs Monolith',
    category: 'architecture',
    description: 'Monolith: simplu, single codebase. Microservicii: servicii mici, independente, scalare granulară. Dezavantaj micro: distribuție, network latency.',
    example: '// Monolith — totul în același app\napp.use("/users", userRoutes);\napp.use("/orders", orderRoutes);\n\n// Microservicii — servicii separate\n// api-gateway → users-service (port 3001)\n// api-gateway → orders-service (port 3002)\n// Comunicare: REST/gRPC/Message Queue (RabbitMQ, Kafka)',
    related: ['clean_architecture', 'docker'],
  },
  api_design: {
    id: 'api_design',
    label: 'API Design Best Practices',
    category: 'architecture',
    description: 'Versioning (/v1/), consistent naming, pagination (cursor-based > offset), error responses standardizate, rate limiting, documentație (OpenAPI).',
    example: '// Consistent error format\nres.status(400).json({\n  error: {\n    code: "VALIDATION_ERROR",\n    message: "Date invalide",\n    details: errors,\n    requestId: req.id, // tracing\n  }\n});\n\n// Cursor pagination\nGET /api/posts?cursor=eyJpZCI6MTAwfQ&limit=20\nResponse: { data: [...], nextCursor: "eyJpZCI6MTIwfQ", hasMore: true }',
    related: ['rest_api', 'rest_vs_graphql'],
  },

  // ── Expo/React Native Specific ──
  expo_router: {
    id: 'expo_router',
    label: 'Expo Router v3',
    category: 'react-native',
    description: 'File-based routing pentru Expo. Directorul app/ = rute. (tabs)/, (auth)/, _layout.tsx. Typed routes. Nested layouts. Link component.',
    example: '// app/\n//   _layout.tsx        — root layout (providers)\n//   (tabs)/\n//     _layout.tsx      — tab bar layout\n//     index.tsx        — /\n//     explore.tsx      — /explore\n//   user/[id].tsx      — /user/:id\n//   (auth)/login.tsx   — /login (grup fără tab bar)\n\nimport { Link, useRouter } from "expo-router";\n<Link href="/user/123">Profil</Link>',
    related: ['expo', 'navigation_rn'],
  },
  eas_build: {
    id: 'eas_build',
    label: 'EAS Build & Submit',
    category: 'react-native',
    description: 'Expo Application Services pentru build APK/AAB/IPA. eas.json profiles. Preview = APK rapid, production = AAB pentru Play Store.',
    example: '// eas.json\n{\n  "build": {\n    "preview": {\n      "android": { "buildType": "apk" },\n      "distribution": "internal"\n    },\n    "production": {\n      "android": { "buildType": "app-bundle" },\n      "autoIncrement": true\n    }\n  }\n}\n\n// Comandă build\neas build --platform android --profile preview\neas build --platform android --profile production',
    related: ['expo', 'ci_cd'],
  },
  expo_updates: {
    id: 'expo_updates',
    label: 'Expo Updates (OTA)',
    category: 'react-native',
    description: 'Over-the-air updates fără a republica în store. expo-updates: checkForUpdateAsync, fetchUpdateAsync, reloadAsync. Instant pentru JS changes.',
    example: 'import * as Updates from "expo-updates";\n\nasync function checkUpdate() {\n  try {\n    const update = await Updates.checkForUpdateAsync();\n    if (update.isAvailable) {\n      await Updates.fetchUpdateAsync();\n      Alert.alert("Update", "Restart pentru update?", [\n        { text: "Da", onPress: () => Updates.reloadAsync() },\n      ]);\n    }\n  } catch (e) {\n    console.error(e);\n  }\n}',
    related: ['expo', 'eas_build'],
  },

  // ── Web APIs & Browser ──
  indexed_db: {
    id: 'indexed_db',
    label: 'IndexedDB',
    category: 'javascript',
    description: 'Baza de date NoSQL în browser. Stocare mare (GB), async, tranzacții. dexie.js = wrapper simplu. Util pentru offline-first web apps.',
    example: 'import Dexie from "dexie";\n\nconst db = new Dexie("MyDatabase");\ndb.version(1).stores({\n  users: "++id, email, name",\n  posts: "++id, userId, createdAt",\n});\n\nawait db.users.add({ email: "a@b.com", name: "Ion" });\nconst user = await db.users.where("email").equals("a@b.com").first();',
    related: ['local_storage', 'service_worker'],
  },
  canvas_api: {
    id: 'canvas_api',
    label: 'Canvas API',
    category: 'javascript',
    description: 'Desenare 2D/pixeli în browser. Grafice custom, image processing, games. ctx.fillRect, ctx.arc, ctx.drawImage, ctx.getImageData.',
    example: 'const canvas = document.getElementById("canvas") as HTMLCanvasElement;\nconst ctx = canvas.getContext("2d")!;\n\n// Gradient\nconst gradient = ctx.createLinearGradient(0, 0, 200, 0);\ngradient.addColorStop(0, "#6C63FF");\ngradient.addColorStop(1, "#00D4FF");\nctx.fillStyle = gradient;\nctx.fillRect(0, 0, 200, 100);\n\n// Text\nctx.font = "bold 24px Inter";\nctx.fillText("Jarvis", 50, 60);',
    related: ['performance', 'web_workers'],
  },

  // ── Networking & APIs ──
  graphql: {
    id: 'graphql',
    label: 'GraphQL',
    category: 'backend',
    description: 'Query language pentru API. Schema definește tipuri. Resolver = funcție care returnează date pentru câmp. Apollo Server/Client. Subscriptions pentru real-time.',
    example: 'const typeDefs = gql`\n  type Query {\n    user(id: ID!): User\n    users: [User!]!\n  }\n  type Mutation {\n    createUser(email: String!, name: String!): User!\n  }\n  type User {\n    id: ID!\n    email: String!\n    name: String!\n    posts: [Post!]!\n  }\n`;\n\nconst resolvers = {\n  Query: {\n    user: (_, { id }) => db.users.findById(id),\n  },\n};',
    related: ['rest_vs_graphql', 'nodejs'],
  },
  oauth: {
    id: 'oauth',
    label: 'OAuth 2.0 & OpenID Connect',
    category: 'securitate',
    description: 'OAuth = autorizare (acces la resurse). OIDC = autentificare (identitate). Flows: Authorization Code (web), PKCE (mobile/SPA), Client Credentials (server-to-server).',
    example: '// PKCE Flow (mobile)\n// 1. Generate code_verifier + code_challenge\n// 2. Redirect la /authorize?code_challenge=...\n// 3. User se autentifică\n// 4. Primești authorization_code\n// 5. Exchange code + code_verifier → access_token\n\nimport * as WebBrowser from "expo-web-browser";\nimport * as AuthSession from "expo-auth-session";\n\nconst discovery = await AuthSession.fetchDiscoveryAsync(issuer);\nconst result = await AuthSession.useAuthRequest({ clientId, scopes });',
    related: ['auth_jwt', 'securitate'],
  },
  grpc: {
    id: 'grpc',
    label: 'gRPC & Protocol Buffers',
    category: 'backend',
    description: 'RPC framework de la Google. Protobuf = serializare binară eficientă. Bidirectional streaming. Ideal pentru microservicii. Type-safe code generation.',
    example: '// user.proto\nsyntax = "proto3";\nservice UserService {\n  rpc GetUser(GetUserRequest) returns (User);\n  rpc ListUsers(ListUsersRequest) returns (stream User);\n}\nmessage User {\n  string id = 1;\n  string email = 2;\n  string name = 3;\n}\n\n// Server TypeScript\nimpl GetUser(call) {\n  return db.users.findById(call.request.id);\n}',
    related: ['rest_api', 'microservices'],
  },

  // ── Accessibility & UX ──
  accessibility: {
    id: 'accessibility',
    label: 'Accessibility (a11y)',
    category: 'ux',
    description: 'Accesibilitate pentru utilizatori cu dizabilități. ARIA labels, role, accessibilityLabel în RN. Contrast ratio minim 4.5:1. Screen reader support.',
    example: '// React Native\n<TouchableOpacity\n  accessible\n  accessibilityRole="button"\n  accessibilityLabel="Trimite mesaj"\n  accessibilityHint="Apasă pentru a trimite mesajul"\n>\n  <Text>Trimite</Text>\n</TouchableOpacity>\n\n// Web\n<button\n  aria-label="Închide modal"\n  aria-expanded={isOpen}\n  role="button"\n>×</button>',
    related: ['react_native', 'react'],
  },
  ux_patterns: {
    id: 'ux_patterns',
    label: 'UX Patterns comune',
    category: 'ux',
    description: 'Optimistic updates, skeleton loaders, error states, empty states, infinite scroll, pull-to-refresh, toast notifications, confirmation dialogs.',
    example: '// Optimistic update — UI se actualizează instant\nconst toggleLike = async (postId: string) => {\n  setLiked(prev => !prev); // imediat\n  setCount(prev => liked ? prev - 1 : prev + 1); // imediat\n  \n  try {\n    await api.toggleLike(postId);\n  } catch {\n    setLiked(prev => !prev); // rollback la eroare\n    setCount(prev => liked ? prev + 1 : prev - 1);\n  }\n};',
    related: ['react', 'react_native'],
  },

  // ── Internalization ──
  i18n: {
    id: 'i18n',
    label: 'Internationalization (i18n)',
    category: 'ux',
    description: 'Suport mai multe limbi. i18next, react-i18next, Expo Localization. Interpolare, plural, format date/numere per locale.',
    example: 'import { useTranslation } from "react-i18next";\n\nconst { t, i18n } = useTranslation();\n\n// ro.json\n{\n  "welcome": "Bun venit, {{name}}!",\n  "items_count": "{{count}} articol",\n  "items_count_other": "{{count}} articole"\n}\n\nt("welcome", { name: "Ion" }); // "Bun venit, Ion!"\nt("items_count", { count: 1 }); // "1 articol"\nt("items_count", { count: 5 }); // "5 articole"',
    related: ['react', 'react_native'],
  },

  // ── Patterns React Native Specific ──
  offline_first: {
    id: 'offline_first',
    label: 'Offline-First Architecture',
    category: 'react-native',
    description: 'Aplicația funcționează fără internet. SQLite ca sursă de adevăr, sync când revine conexiunea. Conflict resolution. NetInfo pentru detectare.',
    example: 'import NetInfo from "@react-native-community/netinfo";\n\nconst { isConnected } = useNetInfo();\n\nasync function saveData(data: Data) {\n  // Întotdeauna salvează local\n  await db.insertLocal(data);\n  \n  if (isConnected) {\n    // Sync imediat dacă online\n    await api.sync(data);\n  } else {\n    // Queue pentru mai târziu\n    await offlineQueue.push({ action: "sync", data });\n  }\n}',
    related: ['sqlite', 'async_storage'],
  },
  push_notifications: {
    id: 'push_notifications',
    label: 'Push Notifications Avansate',
    category: 'react-native',
    description: 'FCM (Firebase Cloud Messaging) + Expo Push. Badge count, notification groups, actions, rich notifications. Foreground vs background handling.',
    example: 'import * as Notifications from "expo-notifications";\n\nNotifications.setNotificationHandler({\n  handleNotification: async () => ({\n    shouldShowAlert: true,\n    shouldPlaySound: true,\n    shouldSetBadge: true,\n  }),\n});\n\n// Listener pentru tap pe notificare\nNotifications.addNotificationResponseReceivedListener(response => {\n  const data = response.notification.request.content.data;\n  router.push(data.route);\n});',
    related: ['expo_notifications', 'deep_linking'],
  },
  biometric_auth: {
    id: 'biometric_auth',
    label: 'Autentificare Biometrică',
    category: 'react-native',
    description: 'expo-local-authentication: Face ID, Touch ID, fingerprint. Fallback la PIN. Combinare cu Secure Store pentru protecție maximă.',
    example: 'import * as LocalAuthentication from "expo-local-authentication";\n\nasync function authenticateWithBiometrics() {\n  const hasHardware = await LocalAuthentication.hasHardwareAsync();\n  const isEnrolled = await LocalAuthentication.isEnrolledAsync();\n  \n  if (!hasHardware || !isEnrolled) return false;\n  \n  const result = await LocalAuthentication.authenticateAsync({\n    promptMessage: "Verifică identitatea ta",\n    fallbackLabel: "Folosește PIN",\n  });\n  return result.success;\n}',
    related: ['secure_store', 'permissions'],
  },
  background_tasks: {
    id: 'background_tasks',
    label: 'Background Tasks',
    category: 'react-native',
    description: 'expo-background-fetch: task periodic în background (sync, cleanup). expo-task-manager: definire tasks. Limitări: iOS mai restrictiv.',
    example: 'import * as BackgroundFetch from "expo-background-fetch";\nimport * as TaskManager from "expo-task-manager";\n\nconst TASK = "background-sync";\n\nTaskManager.defineTask(TASK, async () => {\n  try {\n    await syncData();\n    return BackgroundFetch.BackgroundFetchResult.NewData;\n  } catch {\n    return BackgroundFetch.BackgroundFetchResult.Failed;\n  }\n});\n\nawait BackgroundFetch.registerTaskAsync(TASK, { minimumInterval: 15 * 60 });',
    related: ['expo', 'offline_first'],
  },

  // ── Programare Funcțională ──
  pure_functions: {
    id: 'pure_functions',
    label: 'Funcții Pure',
    category: 'functional',
    description: 'Funcție pură: același input → același output, fără side effects. Testabile, predictibile, cacheabile. Baza programării funcționale.',
    example: '// Pură — fără side effects\nconst add = (a: number, b: number) => a + b;\nconst double = (arr: number[]) => arr.map(n => n * 2); // nu modifică arr\n\n// Impură — are side effects\nlet total = 0;\nconst addToTotal = (n: number) => { total += n; }; // modifică extern\nconst logAdd = (a: number, b: number) => { console.log(a+b); return a+b; }; // console = side effect',
    related: ['functie', 'immutability'],
  },
  immutability: {
    id: 'immutability',
    label: 'Imutabilitate',
    category: 'functional',
    description: 'Nu modifica datele existente, creează copii noi. Previne bug-uri subtile. Object.freeze, spread operator, Immer pentru structuri complexe.',
    example: '// GREȘIT — mutează\nconst user = { name: "Ion", age: 25 };\nuser.age = 26; // mutare directă\n\n// CORECT — imutabil\nconst updatedUser = { ...user, age: 26 }; // copie nouă\n\n// Arrays\nconst arr = [1, 2, 3];\nconst withFour = [...arr, 4]; // nu arr.push(4)!\nconst without2 = arr.filter(n => n !== 2);',
    related: ['pure_functions', 'spread'],
  },
  currying: {
    id: 'currying',
    label: 'Currying & Partial Application',
    category: 'functional',
    description: 'Currying: funcție cu N argumente → N funcții cu 1 argument. Partial application: fix câteva argumente, returnează funcție pentru restul.',
    example: '// Currying\nconst multiply = (a: number) => (b: number) => a * b;\nconst double = multiply(2);\nconst triple = multiply(3);\ndouble(5); // 10\ntriple(5); // 15\n\n// Partial application\nconst log = (level: string, message: string) => console.log(`[${level}] ${message}`);\nconst info = log.bind(null, "INFO"); // partial\nconst error = log.bind(null, "ERROR");\ninfo("App started");',
    related: ['pure_functions', 'closure'],
  },
  composition: {
    id: 'composition',
    label: 'Function Composition',
    category: 'functional',
    description: 'Combina funcții mici în funcții mai mari. compose(f, g)(x) = f(g(x)). pipe = compose inversat (mai ușor de citit). Reactivitate cu RxJS.',
    example: 'const compose = (...fns: Function[]) => (x: any) =>\n  fns.reduceRight((acc, fn) => fn(acc), x);\n\nconst pipe = (...fns: Function[]) => (x: any) =>\n  fns.reduce((acc, fn) => fn(acc), x);\n\nconst processUser = pipe(\n  validateEmail,\n  normalizeUsername,\n  hashPassword,\n  saveToDb\n);',
    related: ['pure_functions', 'currying'],
  },
  functors: {
    id: 'functors',
    label: 'Functors & Monads',
    category: 'functional',
    description: 'Functor: obiect cu .map() (Array, Promise). Monad: functor cu .flatMap(). Maybe monad pentru null safety. Either monad pentru erori.',
    example: '// Maybe Monad — evita null checks\nclass Maybe<T> {\n  constructor(private value: T | null) {}\n  static of<T>(v: T | null) { return new Maybe(v); }\n  map<U>(fn: (v: T) => U): Maybe<U> {\n    return this.value !== null ? Maybe.of(fn(this.value)) : Maybe.of<U>(null);\n  }\n  getOrElse(defaultVal: T): T { return this.value ?? defaultVal; }\n}\n\nconst name = Maybe.of(user).map(u => u.profile).map(p => p.name).getOrElse("Anonim");',
    related: ['pure_functions', 'composition'],
  },
  reactive_programming: {
    id: 'reactive_programming',
    label: 'Reactive Programming & RxJS',
    category: 'functional',
    description: 'Programare bazată pe fluxuri de date asincrone (Observables). RxJS: operators (map, filter, mergeMap, switchMap, debounceTime). Unsubscribe important.',
    example: 'import { fromEvent, debounceTime, switchMap } from "rxjs";\nimport { ajax } from "rxjs/ajax";\n\nconst searchResults$ = fromEvent(inputEl, "input").pipe(\n  map(e => (e.target as HTMLInputElement).value),\n  debounceTime(300),\n  filter(query => query.length > 2),\n  switchMap(query => ajax.getJSON(`/api/search?q=${query}`))\n);\n\nconst sub = searchResults$.subscribe(results => setResults(results));\n// La cleanup:\nsub.unsubscribe();',
    related: ['event_loop', 'observer'],
  },

  // ── Paradigme de Programare ──
  oop_principles: {
    id: 'oop_principles',
    label: 'Principii OOP (SOLID)',
    category: 'oop',
    description: 'S: Single Responsibility. O: Open/Closed. L: Liskov Substitution. I: Interface Segregation. D: Dependency Inversion. Ghid arhitectura durabilă.',
    example: '// S — Single Responsibility\nclass UserRepository { /* CRUD */ }\nclass EmailService { /* emails */ }\n// Nu: class User { saveToDb(); sendEmail(); }\n\n// O — Open for extension, closed for modification\nabstract class Shape { abstract area(): number; }\nclass Circle extends Shape { area() { return Math.PI * r**2; } }\n// Adaugi forme noi fără a modifica Shape\n\n// D — Dependency Inversion\nclass Service { constructor(private repo: IRepository) {} }',
    related: ['clasa', 'design-patterns'],
  },
  encapsulation: {
    id: 'encapsulation',
    label: 'Încapsulare',
    category: 'oop',
    description: 'Ascunde implementarea internă, expune doar API public. Private/Protected în TypeScript. Getters/Setters pentru validare.',
    example: 'class BankAccount {\n  private _balance: number = 0;\n\n  get balance(): number { return this._balance; }\n\n  deposit(amount: number): void {\n    if (amount <= 0) throw new Error("Suma trebuie pozitivă");\n    this._balance += amount;\n  }\n\n  withdraw(amount: number): void {\n    if (amount > this._balance) throw new Error("Fonduri insuficiente");\n    this._balance -= amount;\n  }\n}',
    related: ['clasa', 'oop_principles'],
  },
  inheritance: {
    id: 'inheritance',
    label: 'Moștenire & Polimorfism',
    category: 'oop',
    description: 'Moștenire: subclasa primește proprietățile clasei parent. Polimorfism: metoda override cu comportament diferit. Prefer composition over inheritance.',
    example: 'abstract class Notification {\n  abstract send(message: string): Promise<void>;\n  async notify(msg: string) {\n    console.log("Trimit notificare...");\n    await this.send(msg);\n    console.log("Trimis!");\n  }\n}\n\nclass EmailNotification extends Notification {\n  async send(msg: string) { await sendEmail(this.email, msg); }\n}\n\nclass PushNotification extends Notification {\n  async send(msg: string) { await sendPush(this.token, msg); }\n}',
    related: ['clasa', 'oop_principles'],
  },

  // ── Web Development Specific ──
  spa_architecture: {
    id: 'spa_architecture',
    label: 'SPA vs SSR vs SSG',
    category: 'web',
    description: 'SPA: clientside rendering, fast navigation. SSR: renderare pe server, SEO mai bun. SSG: HTML static pre-generat. ISR: regenerare incrementală.',
    example: '// SPA (React Vite) — toate la client\n// + Navigation rapidă, - SEO, - First load mare\n\n// SSR (Next.js)\nexport async function getServerSideProps() {\n  const data = await fetchData();\n  return { props: { data } };\n}\n\n// SSG\nexport async function getStaticProps() {\n  return { props: { data }, revalidate: 60 };\n}\n\n// ISR — regenerare la fiecare 60s sau on-demand',
    related: ['react', 'performance'],
  },
  pwa: {
    id: 'pwa',
    label: 'Progressive Web Apps (PWA)',
    category: 'web',
    description: 'Web apps cu capabilități native: offline, instalare, push notifications, background sync. manifest.json + Service Worker. Lighthouse score > 90.',
    example: '// manifest.json\n{\n  "name": "My App",\n  "short_name": "App",\n  "start_url": "/",\n  "display": "standalone",\n  "theme_color": "#6C63FF",\n  "icons": [{"src": "/icon-192.png", "sizes": "192x192"}]\n}\n\n// index.html\n<link rel="manifest" href="/manifest.json">\n<meta name="theme-color" content="#6C63FF">',
    related: ['service_worker', 'offline_first'],
  },
  web_vitals: {
    id: 'web_vitals',
    label: 'Core Web Vitals',
    category: 'performance',
    description: 'Metrici Google pentru UX: LCP (largest contentful paint <2.5s), FID/INP (<200ms), CLS (<0.1). Afectează SEO. Lighthouse, PageSpeed Insights.',
    example: '// Optimizări pentru LCP\n// - Preload imaginea hero\n<link rel="preload" as="image" href="/hero.jpg">\n\n// - Server push CSS critic\n// - Reduce time to first byte (TTFB)\n\n// Optimizări pentru CLS\n// - Rezervă spațiu pentru imagini\n<img width="800" height="600" />\n\n// - Animații doar cu transform/opacity (nu layout)',
    related: ['performance', 'css_animations'],
  },
  seo: {
    id: 'seo',
    label: 'SEO pentru Web Apps',
    category: 'web',
    description: 'Meta tags, og:, structured data (JSON-LD), sitemap.xml, robots.txt, canonical, alt text. SSR/SSG pentru crawling. Core Web Vitals afectează ranking.',
    example: '<head>\n  <title>Pagina Mea | Site</title>\n  <meta name="description" content="Descriere concisă 150-160 chars">\n  <meta property="og:title" content="Pagina Mea">\n  <meta property="og:image" content="https://site.com/og.jpg">\n  <link rel="canonical" href="https://site.com/pagina">\n</head>\n\n// JSON-LD\n<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"Article","name":"Titlu"}\n</script>',
    related: ['spa_architecture', 'web_vitals'],
  },

  // ── TypeScript Extra ──
  template_literal_types: {
    id: 'template_literal_types',
    label: 'Template Literal Types',
    category: 'typescript',
    description: 'Tipuri create din concatenare de stringuri. Puternic pentru API route types, event names, CSS class names.',
    example: 'type Alignment = "left" | "center" | "right";\ntype VerticalAlign = "top" | "middle" | "bottom";\ntype AnchorPosition = `${VerticalAlign}-${Alignment}`;\n// "top-left" | "top-center" | ... 9 combinații\n\ntype EventName<T extends string> = `on${Capitalize<T>}`;\ntype ClickEvent = EventName<"click">; // "onClick"\n\n// API routes\ntype Route = `/api/${string}`;\nconst route: Route = "/api/users"; // OK',
    related: ['typescript_basics', 'mapped_types'],
  },
  infer_keyword: {
    id: 'infer_keyword',
    label: 'infer în TypeScript',
    category: 'typescript',
    description: 'Extrage tipuri din condiții. Uzual în conditional types. ReturnType, Parameters, PromiseType sunt implementate cu infer.',
    example: 'type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\ntype Parameters<T> = T extends (...args: infer P) => any ? P : never;\n\n// Custom\ntype UnpackPromise<T> = T extends Promise<infer U> ? U : T;\ntype ArrayElement<T> = T extends (infer E)[] ? E : never;\n\ntype DeepReadonly<T> = T extends object\n  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }\n  : T;',
    related: ['conditional_types', 'generics'],
  },
  declaration_merging: {
    id: 'declaration_merging',
    label: 'Declaration Merging',
    category: 'typescript',
    description: 'TypeScript combină multiple declarații cu același nume. Util pentru extinderea tipurilor externe (augmentation).',
    example: '// Module augmentation — extinde tipuri externe\ndeclare module "express" {\n  interface Request {\n    user?: User;\n    requestId: string;\n  }\n}\n\n// Interface merging\ninterface Config { host: string; }\ninterface Config { port: number; } // merge automat\n// Rezultat: Config { host: string; port: number; }',
    related: ['interfata', 'typescript_basics'],
  },
  readonly_types: {
    id: 'readonly_types',
    label: 'Readonly & Const Assertions',
    category: 'typescript',
    description: 'readonly: câmp imutabil în interfețe. Readonly<T>: toate câmpurile readonly. as const: literal types + readonly la adâncime.',
    example: 'interface Config {\n  readonly apiUrl: string;\n  timeout: number;\n}\n\nconst COLORS = ["red", "green", "blue"] as const;\ntype Color = typeof COLORS[number]; // "red" | "green" | "blue"\n\n// ReadonlyArray — nu permite push/pop\nfunction process(items: ReadonlyArray<string>) {\n  items.push("x"); // Error!\n  return [...items, "x"]; // OK\n}',
    related: ['typescript_basics', 'immutability'],
  },
  zod_advanced: {
    id: 'zod_advanced',
    label: 'Zod Schema Avansate',
    category: 'typescript',
    description: 'Transform, refine, preprocess, discriminatedUnion, recursive schemas, merge, extend, pick, omit, partial.',
    example: 'const DateString = z.string().transform(s => new Date(s));\n\nconst Password = z.string().min(8).refine(\n  p => /[A-Z]/.test(p) && /[0-9]/.test(p),\n  { message: "Parola trebuie să conțină majusculă și cifră" }\n);\n\nconst UpdateSchema = UserSchema.partial().extend({\n  updatedAt: z.date().default(() => new Date()),\n});\n\n// Discriminated union\nconst Action = z.discriminatedUnion("type", [\n  z.object({ type: z.literal("create"), data: UserSchema }),\n  z.object({ type: z.literal("delete"), id: z.string() }),\n]);',
    related: ['validation_zod', 'generics'],
  },

  // ── React Patterns Extra ──
  state_machines: {
    id: 'state_machines',
    label: 'State Machines (XState)',
    category: 'react',
    description: 'Modelează stări și tranziții explicit. Elimină state imposibil (loading AND error în același timp). XState = implementare robustă.',
    example: 'import { createMachine, assign } from "xstate";\n\nconst fetchMachine = createMachine({\n  initial: "idle",\n  states: {\n    idle: { on: { FETCH: "loading" } },\n    loading: {\n      invoke: { src: "fetchData", onDone: "success", onError: "failure" }\n    },\n    success: { entry: assign({ data: (_, e) => e.data }) },\n    failure: { on: { RETRY: "loading" } }\n  }\n});',
    related: ['hooks', 'context'],
  },
  render_optimization: {
    id: 'render_optimization',
    label: 'Optimizare Renders React',
    category: 'react',
    description: 'Evită re-renders inutile: React.memo, useMemo, useCallback, context splitting, lazy state init, keys stabile, evită inline objects în JSX.',
    example: '// Problematic — object nou la fiecare render\n<Component style={{ margin: 10 }} /> // re-render copil mereu\n\n// OK\nconst style = useMemo(() => ({ margin: 10 }), []);\n<Component style={style} />\n\n// Context splitting — Provider separat pentru fiecare slice\n// NU: un context imens cu toată starea\n// DA: AuthContext, ThemeContext, CartContext separate\n\n// Keys stabile în liste\n<Item key={item.id} /> // NU: key={index}',
    related: ['react_memo', 'usememo'],
  },
  compound_components: {
    id: 'compound_components',
    label: 'Compound Components Pattern',
    category: 'react',
    description: 'Componente care lucrează împreună prin context shared implicit. API declarativ, flexibil. Exemplu: Select + Option, Tabs + Tab + Panel.',
    example: 'const TabContext = createContext<{active: string; setActive: (t:string)=>void} | null>(null);\n\nfunction Tabs({ children, defaultTab }: Props) {\n  const [active, setActive] = useState(defaultTab);\n  return <TabContext.Provider value={{active, setActive}}>{children}</TabContext.Provider>;\n}\n\nTabs.Tab = function Tab({ id, children }: TabProps) {\n  const { active, setActive } = useContext(TabContext)!;\n  return <button onClick={() => setActive(id)} className={active === id ? "active" : ""}>{children}</button>;\n};',
    related: ['context', 'custom_hooks'],
  },
  infinite_scroll: {
    id: 'infinite_scroll',
    label: 'Infinite Scroll & Pagination',
    category: 'react',
    description: 'Infinite scroll: încarcă mai mult la scroll end. Cursor pagination > offset. react-query useInfiniteQuery sau FlatList onEndReached.',
    example: 'const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({\n  queryKey: ["posts"],\n  queryFn: ({ pageParam = null }) => fetchPosts({ cursor: pageParam, limit: 20 }),\n  getNextPageParam: (last) => last.nextCursor ?? undefined,\n});\n\nconst posts = data?.pages.flatMap(page => page.items) ?? [];\n\n<FlatList\n  data={posts}\n  onEndReached={() => hasNextPage && fetchNextPage()}\n  ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}\n/>',
    related: ['flatlist', 'react_query'],
  },
  optimistic_updates: {
    id: 'optimistic_updates',
    label: 'Optimistic Updates',
    category: 'react',
    description: 'UI se actualizează instant, înainte de confirmarea server. Rollback la eroare. react-query suport built-in cu onMutate/onError/onSettled.',
    example: 'const mutation = useMutation({\n  mutationFn: toggleLike,\n  onMutate: async (postId) => {\n    await queryClient.cancelQueries({ queryKey: ["post", postId] });\n    const snapshot = queryClient.getQueryData(["post", postId]);\n    queryClient.setQueryData(["post", postId], old => ({ ...old, liked: !old.liked }));\n    return { snapshot }; // context pentru rollback\n  },\n  onError: (err, postId, context) => {\n    queryClient.setQueryData(["post", postId], context?.snapshot);\n  },\n});',
    related: ['react_query', 'ux_patterns'],
  },

  // ── Node.js Extra ──
  event_emitter: {
    id: 'event_emitter',
    label: 'EventEmitter Node.js',
    category: 'backend',
    description: 'Modul core Node.js pentru event-driven programming. emit, on, once, off, removeAllListeners. Max 10 listeners warning.',
    example: 'import { EventEmitter } from "events";\n\nclass JobQueue extends EventEmitter {\n  private queue: (() => Promise<void>)[] = [];\n\n  add(job: () => Promise<void>) {\n    this.queue.push(job);\n    this.emit("job:added", { total: this.queue.length });\n  }\n\n  async process() {\n    for (const job of this.queue) {\n      await job();\n      this.emit("job:completed");\n    }\n    this.emit("queue:empty");\n  }\n}',
    related: ['observer', 'nodejs'],
  },
  worker_threads: {
    id: 'worker_threads',
    label: 'Worker Threads Node.js',
    category: 'backend',
    description: 'Thread-uri reale în Node.js pentru calcul CPU-intensiv. SharedArrayBuffer pentru memorie partajată. Transferable objects.',
    example: 'import { Worker, isMainThread, parentPort, workerData } from "worker_threads";\n\nif (isMainThread) {\n  const worker = new Worker(__filename, { workerData: { nums: [1,2,3,4,5] } });\n  worker.on("message", result => console.log("Sum:", result));\n  worker.on("error", err => console.error(err));\n} else {\n  const sum = workerData.nums.reduce((a: number, b: number) => a + b, 0);\n  parentPort?.postMessage(sum);\n}',
    related: ['nodejs', 'web_workers'],
  },
  cluster_module: {
    id: 'cluster_module',
    label: 'Cluster Module Node.js',
    category: 'backend',
    description: 'Fork mai mulți procese worker pentru a utiliza toate CPU cores. Master process distribuie requesturi. PM2 = cluster manager.',
    example: 'import cluster from "cluster";\nimport { cpus } from "os";\nimport { createServer } from "http";\n\nif (cluster.isPrimary) {\n  const cores = cpus().length;\n  console.log(`Master running. Forking ${cores} workers...`);\n  for (let i = 0; i < cores; i++) cluster.fork();\n  cluster.on("exit", (worker) => {\n    console.log(`Worker ${worker.process.pid} died. Restarting...`);\n    cluster.fork();\n  });\n} else {\n  createServer(app).listen(3000);\n}',
    related: ['nodejs', 'monitoring'],
  },
  crypto_module: {
    id: 'crypto_module',
    label: 'Crypto Module Node.js',
    category: 'backend',
    description: 'Criptografie built-in în Node.js. createHash, createHmac, randomBytes, createCipheriv. WebCrypto API = versiunea browser-compatible.',
    example: 'import { createHash, createHmac, randomBytes } from "crypto";\n\n// Hash\nconst hash = createHash("sha256").update(data).digest("hex");\n\n// HMAC\nconst hmac = createHmac("sha256", secret).update(data).digest("hex");\n\n// Crypto-safe random\nconst token = randomBytes(32).toString("hex"); // 64 char hex token\n\n// Verificare timing-safe (previne timing attacks)\nimport { timingSafeEqual } from "crypto";\nconst isValid = timingSafeEqual(Buffer.from(a), Buffer.from(b));',
    related: ['hashing', 'securitate'],
  },
  session_management: {
    id: 'session_management',
    label: 'Session Management',
    category: 'backend',
    description: 'Sesiuni cu express-session + Redis store. Cookie HttpOnly + Secure + SameSite. Refresh tokens cu rotation. Invalidare la logout.',
    example: 'import session from "express-session";\nimport RedisStore from "connect-redis";\n\napp.use(session({\n  store: new RedisStore({ client: redisClient }),\n  secret: process.env.SESSION_SECRET!,\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    httpOnly: true,\n    secure: process.env.NODE_ENV === "production",\n    sameSite: "strict",\n    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 zile\n  },\n}));',
    related: ['auth_jwt', 'caching_redis'],
  },
  passport_auth: {
    id: 'passport_auth',
    label: 'Passport.js Authentication',
    category: 'backend',
    description: 'Middleware de autentificare pentru Express. Strategii: Local, JWT, Google OAuth, GitHub. Serialize/deserialize user pentru sessions.',
    example: 'import passport from "passport";\nimport { Strategy as LocalStrategy } from "passport-local";\n\npassport.use(new LocalStrategy({ usernameField: "email" },\n  async (email, password, done) => {\n    const user = await db.findByEmail(email);\n    if (!user) return done(null, false, { message: "Email inexistent" });\n    const valid = await bcrypt.compare(password, user.password);\n    return valid ? done(null, user) : done(null, false, { message: "Parolă greșită" });\n  }\n));',
    related: ['auth_jwt', 'session_management'],
  },
  queue_systems: {
    id: 'queue_systems',
    label: 'Message Queues (BullMQ/RabbitMQ)',
    category: 'backend',
    description: 'Procesare asincronă a job-urilor. BullMQ + Redis = coadă în Node.js. Retry, delay, priority. RabbitMQ/Kafka = distributed messaging.',
    example: 'import { Queue, Worker } from "bullmq";\n\nconst emailQueue = new Queue("emails", { connection: redis });\n\n// Producer\nawait emailQueue.add("send-welcome", { to: user.email, name: user.name }, {\n  delay: 1000,\n  attempts: 3,\n  backoff: { type: "exponential", delay: 5000 },\n});\n\n// Consumer\nnew Worker("emails", async (job) => {\n  await sendEmail(job.data.to, job.data.name);\n}, { connection: redis });',
    related: ['nodejs', 'microservices'],
  },

  // ── Baze de Date Extra ──
  query_optimization: {
    id: 'query_optimization',
    label: 'Query Optimization SQL',
    category: 'database',
    description: 'EXPLAIN ANALYZE pentru query plan. N+1 problem cu JOIN sau DataLoader. Index covering. Denormalizare pentru read performance.',
    example: '-- EXPLAIN ANALYZE\nEXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;\n-- Caută: Seq Scan (rău) vs Index Scan (bun)\n\n-- N+1 Problem fix — JOIN în loc de loop\n-- GREȘIT: SELECT posts; pentru fiecare: SELECT user WHERE id=post.user_id\n-- CORECT:\nSELECT p.*, u.name\nFROM posts p\nJOIN users u ON u.id = p.user_id\nWHERE p.published = true;',
    related: ['postgresql', 'indexes'],
  },
  database_connection_pool: {
    id: 'database_connection_pool',
    label: 'Connection Pooling',
    category: 'database',
    description: 'Refolosește conexiuni DB în loc să creeze una nouă per request. Pool size = CPU cores * 2. pg pool în PostgreSQL, PgBouncer pentru scalare extremă.',
    example: 'import { Pool } from "pg";\n\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_URL,\n  max: 20, // conexiuni maxime\n  idleTimeoutMillis: 30000,\n  connectionTimeoutMillis: 2000,\n});\n\n// Drizzle folosește pool automat\nimport { drizzle } from "drizzle-orm/node-postgres";\nconst db = drizzle(pool, { schema });',
    related: ['postgresql', 'transactions'],
  },
  redis_patterns: {
    id: 'redis_patterns',
    label: 'Redis Patterns Avansate',
    category: 'database',
    description: 'Pub/Sub pentru real-time. Sorted Sets pentru leaderboards. Streams pentru event log. Rate limiting cu sliding window. Distributed locks.',
    example: '// Pub/Sub\nconst sub = redis.duplicate();\nawait sub.subscribe("notifications");\nsub.on("message", (channel, msg) => io.emit(channel, JSON.parse(msg)));\nawait redis.publish("notifications", JSON.stringify({ userId, msg }));\n\n// Rate limiting cu sliding window\nasync function isRateLimited(key: string, limit: number, window: number) {\n  const now = Date.now();\n  const pipe = redis.pipeline();\n  pipe.zremrangebyscore(key, 0, now - window);\n  pipe.zadd(key, now, `${now}`);\n  pipe.zcard(key);\n  const [,, count] = await pipe.exec();\n  return count > limit;\n}',
    related: ['caching_redis', 'websocket_server'],
  },
  full_text_search: {
    id: 'full_text_search',
    label: 'Full-Text Search',
    category: 'database',
    description: 'PostgreSQL: tsvector + tsquery, GIN index. Elasticsearch pentru scale mare. Meilisearch = alternativă simplă. Relevance ranking, fuzzy search.',
    example: "-- PostgreSQL FTS\nALTER TABLE articles ADD COLUMN search_vector tsvector\n  GENERATED ALWAYS AS (to_tsvector('romanian', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;\n\nCREATE INDEX idx_articles_fts ON articles USING GIN(search_vector);\n\nSELECT title, ts_rank(search_vector, query) AS rank\nFROM articles, plainto_tsquery('romanian', $1) query\nWHERE search_vector @@ query\nORDER BY rank DESC;",
    related: ['postgresql', 'indexes'],
  },
  database_seeding: {
    id: 'database_seeding',
    label: 'Seeds & Test Fixtures',
    category: 'database',
    description: 'Seeds = date inițiale/demo. Factories = generare date de test. Faker.js pentru date realiste. Seed în CI înainte de E2E tests.',
    example: 'import { faker } from "@faker-js/faker";\n\nasync function seed() {\n  const users = Array.from({ length: 10 }, () => ({\n    id: faker.string.uuid(),\n    name: faker.person.fullName(),\n    email: faker.internet.email().toLowerCase(),\n    createdAt: faker.date.past(),\n  }));\n  await db.insert(usersTable).values(users);\n\n  const posts = users.flatMap(u =>\n    Array.from({ length: 5 }, () => ({ userId: u.id, title: faker.lorem.sentence() }))\n  );\n  await db.insert(postsTable).values(posts);\n}',
    related: ['jest_testing', 'postgresql'],
  },

  // ── Securitate Extra ──
  xss_prevention: {
    id: 'xss_prevention',
    label: 'XSS Prevention',
    category: 'securitate',
    description: 'Cross-Site Scripting: injectare script malițios în paginile altor utilizatori. Prevenție: escape output, CSP, DOMPurify, evită dangerouslySetInnerHTML.',
    example: '// VULNERABIL\ndocument.getElementById("output").innerHTML = userInput; // XSS!\n\n// SAFE\ndocument.getElementById("output").textContent = userInput;\n\n// Cu DOMPurify (dacă ai nevoie de HTML)\nimport DOMPurify from "dompurify";\nelem.innerHTML = DOMPurify.sanitize(userInput, {\n  ALLOWED_TAGS: ["b", "i", "em", "strong"],\n});\n\n// React e safe by default — JSX escape automat\n<div>{userInput}</div> // SAFE\n<div dangerouslySetInnerHTML={{ __html: userInput }} /> // PERICULOS',
    related: ['owasp', 'cors'],
  },
  csrf_prevention: {
    id: 'csrf_prevention',
    label: 'CSRF Prevention',
    category: 'securitate',
    description: 'Cross-Site Request Forgery: request făcut de un site terț în numele utilizatorului autentificat. Prevenție: SameSite cookie, CSRF token, Origin header check.',
    example: 'import csrf from "csurf";\n\n// Middleware CSRF\napp.use(csrf({ cookie: { sameSite: "strict", httpOnly: true } }));\n\n// Trimite token la client\napp.get("/form", (req, res) => {\n  res.render("form", { csrfToken: req.csrfToken() });\n});\n\n// Form\n<input type="hidden" name="_csrf" value={csrfToken}>\n\n// Sau: SameSite=Strict cookie (mai simplu, modern)',
    related: ['owasp', 'auth_jwt'],
  },
  sql_injection: {
    id: 'sql_injection',
    label: 'SQL Injection Prevention',
    category: 'securitate',
    description: 'Cel mai vechi și periculos atac. Prevenție: ÎNTOTDEAUNA parametrizare queries, NU concatenare string. ORM-urile fac asta automat.',
    example: '// VULNERABIL — NICIODATĂ!\nconst q = `SELECT * FROM users WHERE email = "${email}"`;\n// email = "x"; DROP TABLE users; --\n\n// SAFE — parametrizare\nawait db.query("SELECT * FROM users WHERE email = $1", [email]);\n\n// SAFE — Drizzle ORM\nawait db.select().from(users).where(eq(users.email, email));\n\n// SAFE — Prisma\nawait prisma.user.findUnique({ where: { email } });',
    related: ['owasp', 'postgresql'],
  },
  api_security: {
    id: 'api_security',
    label: 'API Security Best Practices',
    category: 'securitate',
    description: 'API Keys în header (nu URL). HTTPS always. Rate limiting. Request size limits. Logging fără date sensibile. API versioning. CORS restrictiv.',
    example: 'app.use(express.json({ limit: "10mb" })); // size limit\napp.use(helmet()); // security headers\napp.use(cors({ origin: allowedOrigins })); // CORS strict\napp.use(limiter); // rate limiting\n\n// API Key validation middleware\nconst apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {\n  const key = req.headers["x-api-key"];\n  if (!key || !isValidKey(key)) return res.status(401).json({ error: "Invalid API key" });\n  next();\n};',
    related: ['owasp', 'rate_limiting'],
  },
  https_ssl: {
    id: 'https_ssl',
    label: 'HTTPS & SSL/TLS',
    category: 'securitate',
    description: 'HTTPS = HTTP + TLS encryption. Certifcat SSL de la Let\'s Encrypt (gratuit). HSTS: forțează HTTPS. Certificate pinning în mobile apps.',
    example: '// Let\'s Encrypt cu certbot\ncertbot --nginx -d myapp.com\n\n// HSTS header\nres.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");\n\n// Redirect HTTP → HTTPS în Nginx\nserver {\n  listen 80;\n  return 301 https://$host$request_uri;\n}\n\n// Mobile: certificate pinning cu TrustKit sau OkHttp',
    related: ['nginx', 'owasp'],
  },

  // ── Cloud & Infrastructure ──
  serverless: {
    id: 'serverless',
    label: 'Serverless (Lambda/Edge Functions)',
    category: 'cloud',
    description: 'Funcții care rulează la request, fără server gestionat. AWS Lambda, Vercel Edge Functions, Cloudflare Workers. Cold start = latentă la first request.',
    example: '// Vercel Edge Function\nexport const config = { runtime: "edge" };\n\nexport default async function handler(req: Request) {\n  const { searchParams } = new URL(req.url);\n  const name = searchParams.get("name") ?? "World";\n  \n  return new Response(JSON.stringify({ message: `Hello, ${name}!` }), {\n    headers: { "Content-Type": "application/json" },\n  });\n}',
    related: ['devops', 'nodejs'],
  },
  cdn: {
    id: 'cdn',
    label: 'CDN & Edge Caching',
    category: 'cloud',
    description: 'Content Delivery Network: servește resurse din noduri apropiate de utilizator. Cache headers, Cloudflare, CloudFront. Edge = cod care rulează în CDN nodes.',
    example: '// Cache headers eficiente\nres.setHeader("Cache-Control", "public, max-age=31536000, immutable"); // assets hashed\nres.setHeader("Cache-Control", "no-cache"); // HTML (revalida la fiecare request)\nres.setHeader("ETag", generateETag(content)); // conditional requests\n\n// Cloudflare Cache Rules\n// *.js, *.css → cache 1 year\n// /api/* → no cache\n// / → cache 5 min with revalidation',
    related: ['performance', 'nginx'],
  },
  kubernetes: {
    id: 'kubernetes',
    label: 'Kubernetes (K8s)',
    category: 'cloud',
    description: 'Orchestrare containere la scară. Pods, Deployments, Services, Ingress, ConfigMaps, Secrets. Auto-scaling, self-healing, rolling updates.',
    example: '# deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-server\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: api\n        image: myregistry/api:v1.2.0\n        ports: [{containerPort: 3000}]\n        resources:\n          requests: {memory: "128Mi", cpu: "100m"}\n          limits: {memory: "256Mi", cpu: "500m"}\n        readinessProbe:\n          httpGet: {path: /health, port: 3000}',
    related: ['docker', 'devops'],
  },
  terraform: {
    id: 'terraform',
    label: 'Infrastructure as Code (Terraform)',
    category: 'cloud',
    description: 'Definire infrastructură ca cod. Providers: AWS, GCP, Azure, Cloudflare. State management. Plan → Apply. Modules pentru reutilizare.',
    example: 'terraform {\n  required_providers {\n    aws = { source = "hashicorp/aws", version = "~> 5.0" }\n  }\n}\n\nresource "aws_s3_bucket" "assets" {\n  bucket = "myapp-assets"\n}\n\nresource "aws_cloudfront_distribution" "cdn" {\n  origin { domain_name = aws_s3_bucket.assets.bucket_domain_name }\n  default_cache_behavior {\n    allowed_methods = ["GET", "HEAD"]\n    viewer_protocol_policy = "redirect-to-https"\n  }\n}',
    related: ['docker', 'kubernetes'],
  },
  github_actions: {
    id: 'github_actions',
    label: 'GitHub Actions',
    category: 'devops',
    description: 'CI/CD platform integrat în GitHub. Workflows = YAML. Marketplace de actions. Runners: ubuntu, macos, windows. Secrets securizate.',
    example: 'name: CI\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env: {POSTGRES_PASSWORD: test}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: {node-version: 20}\n      - run: npm ci\n      - run: npm test\n      - run: npm run build\n      - uses: actions/upload-artifact@v3\n        with: {name: dist, path: dist}',
    related: ['ci_cd', 'docker'],
  },

  // ── Algoritmi Extra ──
  greedy: {
    id: 'greedy',
    label: 'Greedy Algorithms',
    category: 'algoritmi',
    description: 'La fiecare pas, alege opțiunea localmente optimă. Nu garantează optim global. Funcționează pentru: Huffman, scheduling, coin change (monede standard).',
    example: '// Coin change greedy (monede europene — funcționează!)\nfunction makeChange(amount: number, coins: number[]): number[] {\n  const sorted = coins.sort((a, b) => b - a);\n  const result: number[] = [];\n  for (const coin of sorted) {\n    while (amount >= coin) {\n      result.push(coin);\n      amount -= coin;\n    }\n  }\n  return result;\n}\n\n// Interval scheduling\n// Sortează după end time, alege intervalele compatibile',
    related: ['dynamic_programming', 'big_o'],
  },
  backtracking: {
    id: 'backtracking',
    label: 'Backtracking',
    category: 'algoritmi',
    description: 'Explorare sistematică. Încearcă o soluție, dacă nu e validă, "backtrack" și încearcă alta. Permutări, combinări, N-Queens, Sudoku.',
    example: 'function permutations(arr: number[]): number[][] {\n  const result: number[][] = [];\n  function bt(current: number[], remaining: number[]) {\n    if (!remaining.length) { result.push([...current]); return; }\n    for (let i = 0; i < remaining.length; i++) {\n      current.push(remaining[i]);\n      bt(current, [...remaining.slice(0,i), ...remaining.slice(i+1)]);\n      current.pop(); // backtrack\n    }\n  }\n  bt([], arr);\n  return result;\n}',
    related: ['recursivitate', 'dynamic_programming'],
  },
  heaps: {
    id: 'heaps',
    label: 'Heap & Priority Queue',
    category: 'algoritmi',
    description: 'Min-heap: extrage minimul în O(log n). Max-heap: extrage maximul. Aplicații: top-K elements, Dijkstra, heap sort, task scheduling.',
    example: '// Min-Heap\nclass MinHeap {\n  private data: number[] = [];\n  push(val: number) {\n    this.data.push(val);\n    this.bubbleUp(this.data.length - 1);\n  }\n  pop(): number | undefined {\n    const min = this.data[0];\n    const last = this.data.pop()!;\n    if (this.data.length) { this.data[0] = last; this.sinkDown(0); }\n    return min;\n  }\n  private bubbleUp(i: number) { /* ... */ }\n  private sinkDown(i: number) { /* ... */ }\n}',
    related: ['sortare', 'big_o'],
  },
  dijkstra: {
    id: 'dijkstra',
    label: 'Dijkstra & Shortest Path',
    category: 'algoritmi',
    description: 'Cel mai scurt drum în grafuri ponderate (muchii pozitive). O(E log V) cu priority queue. Bellman-Ford pentru muchii negative.',
    example: 'function dijkstra(graph: Map<number, [number, number][]>, start: number): Map<number, number> {\n  const dist = new Map<number, number>();\n  const pq: [number, number][] = [[0, start]]; // [dist, node]\n  dist.set(start, 0);\n  \n  while (pq.length) {\n    pq.sort((a, b) => a[0] - b[0]);\n    const [d, u] = pq.shift()!;\n    if (d > (dist.get(u) ?? Infinity)) continue;\n    for (const [v, w] of graph.get(u) ?? []) {\n      const newDist = d + w;\n      if (newDist < (dist.get(v) ?? Infinity)) {\n        dist.set(v, newDist);\n        pq.push([newDist, v]);\n      }\n    }\n  }\n  return dist;\n}',
    related: ['graph_algorithms', 'heaps'],
  },
  trie: {
    id: 'trie',
    label: 'Trie (Prefix Tree)',
    category: 'algoritmi',
    description: 'Structură de date pentru stringuri cu prefix comun. O(L) insert/search (L = lungime string). Autocomplete, spell checking, IP routing.',
    example: 'class TrieNode {\n  children = new Map<string, TrieNode>();\n  isEnd = false;\n}\n\nclass Trie {\n  root = new TrieNode();\n\n  insert(word: string) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch)!;\n    }\n    node.isEnd = true;\n  }\n\n  search(word: string): boolean {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) return false;\n      node = node.children.get(ch)!;\n    }\n    return node.isEnd;\n  }\n}',
    related: ['tree_structures', 'hash_table'],
  },
  union_find: {
    id: 'union_find',
    label: 'Union-Find (Disjoint Set)',
    category: 'algoritmi',
    description: 'Track componente conexe. Find: găsește rădăcina. Union: unește componente. Path compression + union by rank = aproape O(1).',
    example: 'class UnionFind {\n  parent: number[];\n  rank: number[];\n\n  constructor(n: number) {\n    this.parent = Array.from({length: n}, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n\n  find(x: number): number {\n    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); // path compression\n    return this.parent[x];\n  }\n\n  union(x: number, y: number): boolean {\n    const [px, py] = [this.find(x), this.find(y)];\n    if (px === py) return false;\n    if (this.rank[px] < this.rank[py]) this.parent[px] = py;\n    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;\n    else { this.parent[py] = px; this.rank[px]++; }\n    return true;\n  }\n}',
    related: ['graph_algorithms', 'tree_structures'],
  },
  segment_tree: {
    id: 'segment_tree',
    label: 'Segment Tree & Fenwick Tree',
    category: 'algoritmi',
    description: 'Segment Tree: range queries (sum, min, max) + updates în O(log n). Fenwick Tree (BIT): prefix sum în O(log n), mai simplu de implementat.',
    example: '// Fenwick Tree (Binary Indexed Tree)\nclass BIT {\n  tree: number[];\n  constructor(n: number) { this.tree = new Array(n + 1).fill(0); }\n  \n  update(i: number, delta: number) {\n    for (; i < this.tree.length; i += i & (-i)) this.tree[i] += delta;\n  }\n  \n  query(i: number): number { // prefix sum [1..i]\n    let sum = 0;\n    for (; i > 0; i -= i & (-i)) sum += this.tree[i];\n    return sum;\n  }\n  \n  rangeQuery(l: number, r: number) { return this.query(r) - this.query(l - 1); }\n}',
    related: ['dynamic_programming', 'heaps'],
  },

  // ── Patterns Extra ──
  circuit_breaker: {
    id: 'circuit_breaker',
    label: 'Circuit Breaker Pattern',
    category: 'design-patterns',
    description: 'Previne cascade failures în microservicii. Stări: Closed (normal), Open (erori → fail fast), Half-Open (test recovery). Opossum library pentru Node.js.',
    example: 'import CircuitBreaker from "opossum";\n\nconst options = {\n  timeout: 3000,\n  errorThresholdPercentage: 50, // deschide la 50% erori\n  resetTimeout: 10000, // half-open după 10s\n};\n\nconst breaker = new CircuitBreaker(asyncFunction, options);\n\nbreaker.on("open", () => console.log("Circuit OPEN — fail fast"));\nbreaker.on("close", () => console.log("Circuit CLOSED — normal"));\n\nconst result = await breaker.fire(args).catch(err => defaultResponse);',
    related: ['microservices', 'error_handling'],
  },
  saga_pattern: {
    id: 'saga_pattern',
    label: 'Saga Pattern',
    category: 'design-patterns',
    description: 'Tranzacții distribuite în microservicii. Choreography: fiecare serviciu ascultă events. Orchestration: saga orchestrator coordonează pașii. Compensating transactions.',
    example: '// Choreography Saga\n// 1. OrderService → OrderCreated event\n// 2. InventoryService ascultă → rezervă stoc → InventoryReserved\n// 3. PaymentService ascultă → procesează plată → PaymentProcessed\n// 4. ShippingService ascultă → creează expediere\n\n// Compensare la eșec:\n// PaymentFailed → InventoryService: eliberează stoc\n// InventoryFailed → OrderService: anulează comanda',
    related: ['microservices', 'event_sourcing'],
  },
  outbox_pattern: {
    id: 'outbox_pattern',
    label: 'Transactional Outbox Pattern',
    category: 'design-patterns',
    description: 'Garantează că evenimentele sunt publicate când tranzacția DB reușește. Salvează evenimentul în aceeași tranzacție, procesează async.',
    example: '// Tranzacție atomică: save order + save event\nawait db.transaction(async (tx) => {\n  const order = await tx.insert(orders).values(orderData).returning();\n  \n  // Evenimentul în outbox (aceeași tranzacție!)\n  await tx.insert(outbox).values({\n    aggregateType: "order",\n    eventType: "OrderCreated",\n    payload: JSON.stringify(order[0]),\n    processedAt: null,\n  });\n});\n\n// Worker separat procesează outbox și publică pe queue',
    related: ['saga_pattern', 'event_sourcing'],
  },
  api_gateway: {
    id: 'api_gateway',
    label: 'API Gateway',
    category: 'architecture',
    description: 'Single entry point pentru microservicii. Rate limiting, auth, logging, routing, load balancing, SSL termination. Kong, AWS API Gateway, nginx.',
    example: '// nginx ca API Gateway\nupstream users_service {\n  least_conn;\n  server users-1:3001;\n  server users-2:3001;\n}\n\nupstream orders_service {\n  server orders:3002;\n}\n\nlocation /api/users { proxy_pass http://users_service; }\nlocation /api/orders {\n  auth_request /auth/verify;\n  proxy_pass http://orders_service;\n}',
    related: ['microservices', 'nginx'],
  },
  cqrs: {
    id: 'cqrs',
    label: 'CQRS Pattern',
    category: 'architecture',
    description: 'Command Query Responsibility Segregation. Comenzi (write) și queries (read) separate. Read model denormalizat pentru performanță. Eventual consistency.',
    example: '// Commands\nasync function createOrder(cmd: CreateOrderCommand): Promise<void> {\n  // Validare\n  // Modifică starea (write DB)\n  // Emite eveniment\n}\n\n// Queries — read model separat, denormalizat\nasync function getOrderSummary(userId: string): Promise<OrderSummary[]> {\n  return redis.get(`orders:${userId}`) ?? // cache\n    db.query("SELECT o.id, o.total, p.name FROM orders_view WHERE user_id = $1", [userId]);\n}',
    related: ['event_sourcing', 'microservices'],
  },

  // ── Mobile Extra ──
  state_persistence: {
    id: 'state_persistence',
    label: 'State Persistence React Native',
    category: 'react-native',
    description: 'Persistă starea app peste restart. Zustand persist + AsyncStorage. Redux Persist. MMKV pentru performanță maximă (mult mai rapid decât AsyncStorage).',
    example: 'import { MMKV } from "react-native-mmkv";\nimport { create } from "zustand";\nimport { persist, createJSONStorage } from "zustand/middleware";\n\nconst storage = new MMKV();\nconst mmkvStorage = createJSONStorage(() => ({\n  setItem: (k, v) => storage.set(k, v),\n  getItem: (k) => storage.getString(k) ?? null,\n  removeItem: (k) => storage.delete(k),\n}));\n\nconst useStore = create(persist(storeConfig, { name: "app-store", storage: mmkvStorage }));',
    related: ['async_storage', 'zustand'],
  },
  react_native_new_arch: {
    id: 'react_native_new_arch',
    label: 'RN New Architecture (JSI/Fabric)',
    category: 'react-native',
    description: 'New Architecture = JSI + Fabric + TurboModules. JSI: comunicare directă JS↔Native fără bridge async. Fabric: noul renderer. newArchEnabled: true în app.json.',
    example: '// app.json\n{\n  "expo": {\n    "newArchEnabled": true\n  }\n}\n\n// Verificare dacă new arch e activă\nimport { NativeModules } from "react-native";\nconst isNewArch = global.__reactFiber !== undefined;\n\n// Beneficii:\n// - Animations mai fluide (Reanimated 3 pe UI thread)\n// - Modules mai rapide (TurboModules)\n// - Rendering mai eficient (Fabric)',
    related: ['react_native', 'reanimated'],
  },
  flipper_debugging: {
    id: 'flipper_debugging',
    label: 'Debugging React Native',
    category: 'react-native',
    description: 'Hermes debugger, Flipper (network, layout, DB), React DevTools, Reactotron. __DEV__ flag pentru cod de debug. LogBox pentru warning filtering.',
    example: '// Condiție debug-only\nif (__DEV__) {\n  console.log("Debug state:", JSON.stringify(state, null, 2));\n}\n\n// Reactotron setup\nimport Reactotron from "reactotron-react-native";\nif (__DEV__) {\n  Reactotron.configure().useReactNative().connect();\n}\n\n// LogBox — ascunde warnings specifice\nimport { LogBox } from "react-native";\nLogBox.ignoreLogs(["Warning: componentWillMount"]);\nLogBox.ignoreAllLogs(__DEV__); // pentru dev clean',
    related: ['react_native', 'testing'],
  },
  android_ios_differences: {
    id: 'android_ios_differences',
    label: 'Android vs iOS în React Native',
    category: 'react-native',
    description: 'Platform differences: shadow (iOS) vs elevation (Android), StatusBar, Keyboard behavior, permissions flow, keychain vs keystore.',
    example: 'import { Platform } from "react-native";\n\nconst styles = StyleSheet.create({\n  card: {\n    ...Platform.select({\n      ios: {\n        shadowColor: "#000",\n        shadowOffset: { width: 0, height: 2 },\n        shadowOpacity: 0.25,\n      },\n      android: {\n        elevation: 5,\n      },\n    }),\n  },\n});\n\nconst isAndroid = Platform.OS === "android";\nconst iosVersion = Platform.Version; // iOS number\nconst androidAPI = Platform.Version; // Android API level',
    related: ['react_native', 'stylesheet_rn'],
  },

  // ── Networking Extra ──
  http_methods: {
    id: 'http_methods',
    label: 'HTTP Status Codes',
    category: 'backend',
    description: '2xx Success: 200 OK, 201 Created, 204 No Content. 3xx Redirect: 301 Permanent, 302 Temp. 4xx Client: 400 Bad Request, 401 Unauth, 403 Forbidden, 404 Not Found, 422 Unprocessable. 5xx Server: 500, 503.',
    example: '// Express patterns\nres.status(201).json({ id: newUser.id }); // Creat\nres.status(204).send(); // Succes, fără body\nres.status(400).json({ error: "Câmpuri lipsă" }); // Bad request\nres.status(401).json({ error: "Neautentificat" }); // Nu știm cine ești\nres.status(403).json({ error: "Interzis" }); // Știm cine ești, dar nu ai voie\nres.status(404).json({ error: "Nu găsit" });\nres.status(409).json({ error: "Conflict — email deja există" });\nres.status(422).json({ error: "Date invalide", details: errors });',
    related: ['rest_api', 'express'],
  },
  http_caching: {
    id: 'http_caching',
    label: 'HTTP Caching',
    category: 'backend',
    description: 'Cache-Control: max-age, no-cache, no-store, stale-while-revalidate. ETag + If-None-Match. Last-Modified + If-Modified-Since. Vary header.',
    example: '// Immutable assets (hash în filename)\nres.setHeader("Cache-Control", "public, max-age=31536000, immutable");\n\n// HTML — revalidare la fiecare request\nres.setHeader("Cache-Control", "no-cache");\n\n// API responses — cache 5 min, stale 1 min\nres.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");\n\n// ETag\nconst etag = hash(content);\nif (req.headers["if-none-match"] === etag) return res.status(304).send();\nres.setHeader("ETag", etag).json(data);',
    related: ['nginx', 'cdn'],
  },
  content_negotiation: {
    id: 'content_negotiation',
    label: 'Content Negotiation & Headers',
    category: 'backend',
    description: 'Accept header: ce formate acceptă clientul. Content-Type: formatul body-ului. Authorization. X-Request-ID pentru tracing. Accept-Language.',
    example: 'app.get("/data", (req, res) => {\n  const accept = req.headers.accept ?? "*/*";\n  \n  if (accept.includes("application/json")) {\n    return res.json(data);\n  }\n  if (accept.includes("text/csv")) {\n    return res.type("csv").send(toCsv(data));\n  }\n  if (accept.includes("text/xml")) {\n    return res.type("xml").send(toXml(data));\n  }\n  \n  res.status(406).json({ error: "Not Acceptable" });\n});',
    related: ['rest_api', 'api_design'],
  },

  // ── Tools & Ecosystem ──
  monorepo: {
    id: 'monorepo',
    label: 'Monorepo Architecture',
    category: 'tools',
    description: 'Toate pachetele într-un singur repo. Tools: pnpm workspaces, Turborepo, Nx. Shared packages, atomic commits, simplifică coordonarea.',
    example: '# pnpm-workspace.yaml\npackages:\n  - "apps/*"\n  - "packages/*"\n\n# Structure\nmonorepo/\n  apps/\n    web/\n    mobile/\n    api/\n  packages/\n    ui/       # shared components\n    utils/    # shared utilities\n    types/    # shared TypeScript types\n  pnpm-workspace.yaml\n  turbo.json',
    related: ['npm_yarn_pnpm', 'ci_cd'],
  },
  storybook: {
    id: 'storybook',
    label: 'Storybook',
    category: 'tools',
    description: 'Dezvoltare și documentare componente izolat. Stories = variante ale componentei. Add-ons: controls, a11y, viewport, interactions.',
    example: '// Button.stories.tsx\nimport type { Meta, StoryObj } from "@storybook/react";\nimport { Button } from "./Button";\n\nconst meta: Meta<typeof Button> = {\n  component: Button,\n  args: { children: "Apasă" },\n};\nexport default meta;\n\nexport const Primary: StoryObj = {\n  args: { variant: "primary", size: "md" },\n};\n\nexport const Disabled: StoryObj = {\n  args: { disabled: true },\n};',
    related: ['testing', 'react'],
  },
  graphql_client: {
    id: 'graphql_client',
    label: 'Apollo Client',
    category: 'tools',
    description: 'GraphQL client pentru React. useQuery, useMutation, useSubscription. Normalized cache, optimistic updates, pagination.',
    example: 'const GET_USERS = gql`\n  query GetUsers($page: Int!) {\n    users(page: $page) {\n      id name email\n      posts { id title }\n    }\n  }\n`;\n\nconst { data, loading, error, fetchMore } = useQuery(GET_USERS, {\n  variables: { page: 1 },\n  fetchPolicy: "cache-and-network",\n});\n\nconst [createUser] = useMutation(CREATE_USER, {\n  update: (cache, { data }) => {\n    cache.modify({ fields: { users: (existing) => [...existing, data.createUser] } });\n  },\n});',
    related: ['graphql', 'react_query'],
  },
  openapi: {
    id: 'openapi',
    label: 'OpenAPI / Swagger',
    category: 'tools',
    description: 'Standard pentru documentare API REST. YAML/JSON schema. Code generation pentru client SDK, Zod schemas, mocking. Swagger UI interactiv.',
    example: 'openapi: 3.1.0\ninfo:\n  title: My API\n  version: 1.0.0\npaths:\n  /users/{id}:\n    get:\n      summary: Obține un user\n      parameters:\n        - name: id\n          in: path\n          required: true\n          schema: {type: string}\n      responses:\n        "200":\n          content:\n            application/json:\n              schema: {$ref: "#/components/schemas/User"}',
    related: ['rest_api', 'validation_zod'],
  },
  nx_turborepo: {
    id: 'nx_turborepo',
    label: 'Turborepo & Nx',
    category: 'tools',
    description: 'Build systems pentru monorepo. Task caching: nu re-build dacă nu s-a schimbat nimic. Dependency graph. Remote caching (Vercel, Nx Cloud).',
    example: '// turbo.json\n{\n  "tasks": {\n    "build": {\n      "dependsOn": ["^build"],\n      "outputs": ["dist/**"],\n      "cache": true\n    },\n    "test": {\n      "dependsOn": ["^build"],\n      "cache": true\n    },\n    "dev": {\n      "persistent": true,\n      "cache": false\n    }\n  }\n}\n\n// Run în paralel\nnpx turbo build test lint',
    related: ['monorepo', 'ci_cd'],
  },

  // ── Programare Generală ──
  design_principles: {
    id: 'design_principles',
    label: 'DRY, YAGNI, KISS',
    category: 'architecture',
    description: 'DRY: Don\'t Repeat Yourself — extrage cod comun. YAGNI: You Ain\'t Gonna Need It — nu adăuga funcționalitate inutilă. KISS: Keep It Simple, Stupid.',
    example: '// DRY — extrage logica repetată\n// GREȘIT: același cod în 3 locuri\n// CORECT:\nconst formatCurrency = (amount: number, currency = "RON") =>\n  new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(amount);\n\n// YAGNI — nu adăuga config dacă nu e nevoie acum\n// GREȘIT: clasa abstractă complexă pentru ceva simplu\n// CORECT: funcție simplă care face exact ce trebuie\n\n// KISS — cel mai simplu cod care funcționează',
    related: ['oop_principles', 'clean_architecture'],
  },
  code_review_practices: {
    id: 'code_review_practices',
    label: 'Code Review Best Practices',
    category: 'tools',
    description: 'Checklist: corectitudine, edge cases, securitate, performanță, readability, tests. PR mic = review mai bun. Feedback constructiv.',
    example: '// Checklist Code Review:\n// ✓ Funcționează corect?\n// ✓ Edge cases gestionate? (null, empty, overflow)\n// ✓ Securitate? (input validation, auth, injection)\n// ✓ Performanță? (N+1, memory leaks, complexity)\n// ✓ Teste suficiente?\n// ✓ Cod lizibil? (naming, comments unde e nevoie)\n// ✓ Breaking changes?\n// ✓ Erori gestionate corect?\n\n// PR Description:\n// Ce rezolvă, cum, cum se testează',
    related: ['tdd', 'git_advanced'],
  },
  technical_debt: {
    id: 'technical_debt',
    label: 'Technical Debt Management',
    category: 'architecture',
    description: 'Datorie tehnică = cost viitor pentru decizii rapide acum. Track cu TODO, FIXME, tech debt backlog. Boy Scout Rule: lasă codul mai curat decât l-ai găsit.',
    example: '// Track debt cu comentarii clare\n// TODO(name, date): refactorizare necesară\n// FIXME(name): bug cunoscut, workaround temporar\n// HACK: soluție temporară pentru deadline\n// DEBT: performanță slabă, necesită optimizare\n\n// eslint rule pentru TODO tracking\n"no-warning-comments": ["warn", { terms: ["FIXME", "HACK"] }]\n\n// Boy Scout Rule:\n// Când modifici un fișier, lasă-l puțin mai curat',
    related: ['clean_architecture', 'code_review_practices'],
  },
  documentation: {
    id: 'documentation',
    label: 'Documentație & JSDoc',
    category: 'tools',
    description: 'JSDoc pentru funcții publice. README.md cu setup, features, API. Comentarii pentru WHY nu WHAT. TypeDoc generează docs automat.',
    example: '/**\n * Calculează taxa pentru o sumă.\n * @param amount - Suma de bază în RON\n * @param rate - Rata taxei (0-1)\n * @param options - Opțiuni suplimentare\n * @returns Suma taxei\n * @throws {RangeError} Dacă rate nu e în [0,1]\n * @example\n * calculateTax(100, 0.19) // 19\n */\nexport function calculateTax(\n  amount: number,\n  rate: number,\n  options?: { round?: boolean }\n): number {\n  if (rate < 0 || rate > 1) throw new RangeError("rate trebuie să fie în [0,1]");\n  const tax = amount * rate;\n  return options?.round ? Math.round(tax) : tax;\n}',
    related: ['typescript_basics', 'code_review_practices'],
  },
  api_versioning: {
    id: 'api_versioning',
    label: 'API Versioning Strategies',
    category: 'architecture',
    description: 'URL versioning (/v1/), header versioning (Accept-Version: v2), query param (?version=2). URL = cel mai clar. Backward compatibility, deprecation policy.',
    example: '// URL versioning (recomandat)\napp.use("/api/v1", v1Router);\napp.use("/api/v2", v2Router);\n\n// Deprecation headers\napp.use("/api/v1", (req, res, next) => {\n  res.setHeader("Deprecation", "true");\n  res.setHeader("Sunset", "2025-12-31");\n  res.setHeader("Link", `<https://api.example.com/v2${req.path}>; rel="successor-version"`);\n  next();\n});\n\n// Header versioning\nconst version = req.headers["api-version"] ?? "v1";',
    related: ['api_design', 'rest_api'],
  },
  feature_flags: {
    id: 'feature_flags',
    label: 'Feature Flags',
    category: 'architecture',
    description: 'Activează/dezactivează funcționalități fără deploy. A/B testing, gradual rollout, kill switch. LaunchDarkly, Unleash, homemade cu env vars.',
    example: '// Simplu cu env vars\nconst features = {\n  newCheckout: process.env.FEATURE_NEW_CHECKOUT === "true",\n  darkMode: process.env.FEATURE_DARK_MODE === "true",\n};\n\n// React component\nfunction App() {\n  return features.newCheckout ? <NewCheckout /> : <OldCheckout />;\n}\n\n// Cu LaunchDarkly\nconst variation = ldClient.variation("new-checkout-flow", user, false);\nif (variation) showNewCheckout();\nelse showOldCheckout();',
    related: ['ci_cd', 'clean_architecture'],
  },

  // ── React Native Expo Specific ──
  expo_file_system: {
    id: 'expo_file_system',
    label: 'Expo File System',
    category: 'react-native',
    description: 'Acces fișiere locale în Expo. expo-file-system/legacy pentru API clasic. documentDirectory, cacheDirectory. Citire, scriere, ștergere, stat.',
    example: 'import { readAsStringAsync, writeAsStringAsync, documentDirectory, deleteAsync, getInfoAsync } from "expo-file-system/legacy";\n\nconst path = `${documentDirectory}myfile.txt`;\nawait writeAsStringAsync(path, "conținut");\nconst content = await readAsStringAsync(path);\n\nconst info = await getInfoAsync(path);\nif (info.exists) console.log("Mărime:", info.size);\n\nawait deleteAsync(path, { idempotent: true });',
    related: ['expo', 'offline_first'],
  },
  expo_sharing: {
    id: 'expo_sharing',
    label: 'Expo Sharing',
    category: 'react-native',
    description: 'Partajează fișiere locale cu alte aplicații. Share sheet nativ iOS/Android. expo-sharing: shareAsync cu UTI pentru iOS, mime type Android.',
    example: 'import * as Sharing from "expo-sharing";\nimport { writeAsStringAsync, documentDirectory } from "expo-file-system/legacy";\n\nasync function shareCode(code: string, filename: string) {\n  const path = `${documentDirectory}${filename}`;\n  await writeAsStringAsync(path, code);\n  \n  const canShare = await Sharing.isAvailableAsync();\n  if (canShare) {\n    await Sharing.shareAsync(path, {\n      mimeType: "text/plain",\n      dialogTitle: `Salvează ${filename}`,\n    });\n  }\n}',
    related: ['expo_file_system', 'expo'],
  },
  expo_media_library: {
    id: 'expo_media_library',
    label: 'Expo Media Library & Permissions',
    category: 'react-native',
    description: 'Salvează fișiere în galerie/Photos. Cere permisiune MEDIA_LIBRARY. saveToLibraryAsync pentru imagini. Alternativă la Sharing pentru export.',
    example: 'import * as MediaLibrary from "expo-media-library";\n\nasync function saveImageToGallery(uri: string) {\n  const { status } = await MediaLibrary.requestPermissionsAsync();\n  if (status !== "granted") {\n    Alert.alert("Permisiune necesară", "Acordă acces la Galerie în Setări");\n    return;\n  }\n  const asset = await MediaLibrary.createAssetAsync(uri);\n  const album = await MediaLibrary.getAlbumAsync("Jarvis");\n  if (album) await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);\n  else await MediaLibrary.createAlbumAsync("Jarvis", asset, false);\n}',
    related: ['expo_camera_api', 'permissions'],
  },
  flatlist_performance: {
    id: 'flatlist_performance',
    label: 'FlatList Performance Tuning',
    category: 'react-native',
    description: 'Profiling cu Flipper, React DevTools. Optimizări: getItemLayout, initialNumToRender, maxToRenderPerBatch, updateCellsBatchingPeriod, keyExtractor stabil.',
    example: 'const keyExtractor = useCallback((item: Item) => item.id, []);\nconst renderItem = useCallback(({ item }: { item: Item }) => <ItemRow item={item} />, []);\nconst getItemLayout = useCallback((_: any, i: number) => ({\n  length: ITEM_HEIGHT,\n  offset: ITEM_HEIGHT * i,\n  index: i,\n}), []);\n\n<FlatList\n  data={data}\n  keyExtractor={keyExtractor}\n  renderItem={renderItem}\n  getItemLayout={getItemLayout}\n  initialNumToRender={10}\n  maxToRenderPerBatch={5}\n  windowSize={7}\n  removeClippedSubviews={Platform.OS === "android"}\n/>',
    related: ['flatlist', 'performance'],
  },

  // ── JavaScript Extra ──
  optional_chaining: { id: 'optional_chaining', label: 'Optional Chaining (?.) & Nullish (??)', category: 'javascript', description: '?. accesează proprietate sigur fără null check. ?? returnează dreapta dacă stânga e null/undefined. Diferit de || care tratează falsy ca null.', example: 'const city = user?.address?.city; // undefined dacă user sau address e null\nconst name = user?.getName?.(); // apelează metodă sigur\nconst port = config?.port ?? 3000; // default\n\n// ?? vs || diferenta\nconst a = 0 ?? 42; // 0 (0 nu e null!)\nconst b = 0 || 42; // 42 (0 e falsy)', related: ['null_undefined', 'variabila'] },
  for_of_in: { id: 'for_of_in', label: 'for...of & for...in', category: 'javascript', description: 'for...of iterează valorile (arrays, string, Map, Set, generator). for...in iterează cheile unui obiect (evită pe arrays!).', example: 'for (const item of [1,2,3]) console.log(item); // 1 2 3\nfor (const char of "hello") console.log(char); // h e l l o\nfor (const [key, val] of map) console.log(key, val);\n\nfor (const key in obj) {\n  if (obj.hasOwnProperty(key)) console.log(key, obj[key]);\n}', related: ['array_methods', 'iterators_generators'] },
  tagged_templates: { id: 'tagged_templates', label: 'Computed Property Names', category: 'javascript', description: 'Proprietăți dinamice în object literal. Utile pentru chei din variabile sau simboluri.', example: 'const key = "name";\nconst obj = { [key]: "Ion", [`get${key}`]: () => obj.name };\n// { name: "Ion", getname: [Function] }\n\nconst buildQuery = (fields: string[]) =>\n  fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});', related: ['destructuring', 'variabila'] },
  object_methods_js: { id: 'object_methods_js', label: 'Object Methods', category: 'javascript', description: 'Object.keys/values/entries, Object.assign, Object.create, Object.freeze, Object.fromEntries, Object.hasOwn, structuredClone.', example: 'Object.keys(obj); // ["a", "b"]\nObject.values(obj); // [1, 2]\nObject.entries(obj); // [["a",1], ["b",2]]\nObject.fromEntries([["a",1]]); // {a:1}\n\n// Deep clone (modern)\nconst clone = structuredClone(complexObj);\n\n// Immutable\nconst frozen = Object.freeze({ x: 1 }); // nu mai poți modifica', related: ['destructuring', 'immutability'] },
  number_methods: { id: 'number_methods', label: 'Number & Math Methods', category: 'javascript', description: 'Number.isInteger, isFinite, isNaN, parseInt, parseFloat, toFixed. Math.min/max, abs, round, floor, ceil, sqrt, pow, random.', example: 'Number.isInteger(4.0); // true\nNumber.isNaN(NaN); // true (isNaN("x") = true, deci folosește Number.isNaN)\nparseInt("42px"); // 42\n\nMath.max(1, 2, 3); // 3\nMath.max(...arr); // spread\nMath.floor(Math.random() * 10); // 0-9\n(3.14159).toFixed(2); // "3.14"', related: ['variabila', 'string_methods'] },
  date_js: { id: 'date_js', label: 'Date & Intl API', category: 'javascript', description: 'Date obiect pentru timp. Intl.DateTimeFormat pentru formatare locale-aware. date-fns/dayjs = librarii recomandate (Date e complicat).', example: 'const now = new Date();\nnow.getTime(); // timestamp ms\nnow.toISOString(); // "2024-03-15T10:30:00.000Z"\n\n// Intl — formatare locale\nnew Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "long", year: "numeric" }).format(now);\n// "15 martie 2024"\n\n// date-fns (recomandat)\nimport { format, addDays, differenceInDays } from "date-fns";', related: ['string_methods', 'i18n'] },
  typeof_instanceof: { id: 'typeof_instanceof', label: 'typeof & instanceof', category: 'javascript', description: 'typeof returnează tipul primitiv ca string. instanceof verifică prototipul. Limitări: typeof null === "object"!', example: 'typeof "hello"; // "string"\ntypeof 42; // "number"\ntypeof true; // "boolean"\ntypeof undefined; // "undefined"\ntypeof null; // "object" — BUG celebru JS!\ntypeof {}; // "object"\ntypeof () => {}; // "function"\n\n[] instanceof Array; // true\nnew Date() instanceof Date; // true\n\n// Verificare null safe\nconst isObj = (x: unknown) => x !== null && typeof x === "object";', related: ['type_guards', 'variabila'] },
  spread_in_calls: { id: 'spread_in_calls', label: 'Arguments & Default Params', category: 'javascript', description: 'Parametri cu valori default, rest params. arguments object (vechi). call, apply, bind pentru this binding.', example: 'function greet(name = "World", greeting = "Hello") {\n  return `${greeting}, ${name}!`;\n}\n\nfunction sum(...nums: number[]) {\n  return nums.reduce((a, b) => a + b, 0);\n}\n\nconst obj = { x: 42 };\nfunction getX() { return this.x; }\ngetX.call(obj); // 42\ngetX.apply(obj, []); // 42\nconst boundGetX = getX.bind(obj); // funcție nouă', related: ['functie', 'closure'] },
  array_destructure: { id: 'array_destructure', label: 'Array & Object Iteration', category: 'javascript', description: 'forEach, for...of, entries() pentru index+value. Object.keys/values/entries + forEach. Array.from pentru conversii.', example: 'const arr = ["a", "b", "c"];\narr.forEach((val, idx) => console.log(idx, val));\n\n// Cu index în for...of\nfor (const [i, val] of arr.entries()) console.log(i, val);\n\n// Object iteration\nfor (const [key, val] of Object.entries(config)) { /* */ }\n\n// Array.from\nArray.from("hello"); // ["h","e","l","l","o"]\nArray.from({length:5}, (_,i) => i*2); // [0,2,4,6,8]', related: ['array_methods', 'destructuring'] },
  nullish_coalescing: { id: 'nullish_coalescing', label: 'Coercion & Type Conversion', category: 'javascript', description: 'Conversie implicită (coercion) vs explicită. Truthy/falsy: 0, "", null, undefined, NaN, false = falsy. Restul = truthy.', example: '// Implicit coercion — surprize!\n"5" + 3; // "53" (string concat!)\n"5" - 3; // 2 (subtractie)\n[] + []; // ""\n[] + {}; // "[object Object]"\n!!0; // false\n!!""; // false\n!!null; // false\n!!undefined; // false\n\n// Explicit conversion\nNumber("42"); // 42\nString(42); // "42"\nBoolean(0); // false', related: ['null_undefined', 'variabila'] },

  // ── TypeScript Patterns Extra ──
  type_narrowing: { id: 'type_narrowing', label: 'Exhaustive Checks', category: 'typescript', description: 'Verifică că toate cazele sunt tratate. Funcție assertNever + never type. Util cu switch pe union types.', example: 'type Shape = "circle" | "square" | "triangle";\n\nfunction describeShape(s: Shape): string {\n  switch (s) {\n    case "circle": return "formă rotundă";\n    case "square": return "formă pătrată";\n    case "triangle": return "formă triunghiulară";\n    default: {\n      const _never: never = s; // Eroare TypeScript dacă adaugi shape fără handler\n      return _never;\n    }\n  }\n}', related: ['never_type', 'union_types'] },
  index_signatures: { id: 'index_signatures', label: 'Index Signatures TypeScript', category: 'typescript', description: 'Tipuri pentru obiecte cu chei dinamice. [key: string]: ValueType. Combinabil cu proprietăți fixe.', example: 'interface StringMap {\n  [key: string]: string;\n}\n\ninterface Config {\n  host: string;\n  port: number;\n  [key: string]: string | number; // extensibil\n}\n\ntype TranslationDict = Record<string, Record<string, string>>;\n\n// Util pentru CSS modules, i18n, configs\nconst translations: TranslationDict = {\n  en: { hello: "Hello" },\n  ro: { hello: "Salut" },\n};', related: ['interfata', 'mapped_types'] },
  discriminated_unions: { id: 'discriminated_unions', label: 'Discriminated Unions', category: 'typescript', description: 'Union types cu câmp discriminator comun (type, kind). TypeScript le narrowează automat în switch/if.', example: 'type ApiState<T> =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "success"; data: T }\n  | { status: "error"; error: string };\n\nfunction render<T>(state: ApiState<T>) {\n  switch (state.status) {\n    case "loading": return <Spinner />;\n    case "success": return <Data data={state.data} />; // data e disponibil\n    case "error": return <Error msg={state.error} />; // error e disponibil\n    default: return null;\n  }\n}', related: ['union_types', 'type_guards'] },
  namespace_ts: { id: 'namespace_ts', label: 'Namespace & Module Augmentation', category: 'typescript', description: 'Namespace: organizare cod în spații de nume (vechi, prefer modules). Module augmentation: extinde tipuri din pachete externe.', example: '// Augmentare Express request\ndeclare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n      DATABASE_URL: string;\n      JWT_SECRET: string;\n      NODE_ENV: "development" | "production" | "test";\n    }\n  }\n}\n\n// ProcessEnv acum are autocompletare!\nprocess.env.DATABASE_URL; // string (nu string | undefined)', related: ['declaration_merging', 'typescript_basics'] },
  type_predicates: { id: 'type_predicates', label: 'Type Predicates & Assertion Functions', category: 'typescript', description: 'Type predicates: param is Type. Assertion functions: asserts param is Type sau asserts condition.', example: 'function isString(x: unknown): x is string {\n  return typeof x === "string";\n}\n\n// Assertion function\nfunction assert(condition: boolean, msg: string): asserts condition {\n  if (!condition) throw new Error(msg);\n}\n\nfunction assertIsUser(obj: unknown): asserts obj is User {\n  if (!obj || typeof obj !== "object" || !(obj as any).id)\n    throw new Error("Not a User");\n}\n\nassert(arr.length > 0, "Array is empty");\n// After: arr.length e > 0 guaranteed', related: ['type_guards', 'never_type'] },

  // ── React Patterns Extra ──
  use_reducer: { id: 'use_reducer', label: 'useReducer', category: 'react', description: 'Alternativă la useState pentru state complex sau cu tranziții. Reducer pur: (state, action) => newState. Mai predictibil, ușor de testat.', example: 'type State = { count: number; step: number };\ntype Action = { type: "increment" } | { type: "decrement" } | { type: "setStep"; step: number };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case "increment": return { ...state, count: state.count + state.step };\n    case "decrement": return { ...state, count: state.count - state.step };\n    case "setStep": return { ...state, step: action.step };\n    default: return state;\n  }\n}\n\nconst [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });', related: ['hooks', 'usestate'] },
  use_transition: { id: 'use_transition', label: 'useTransition & useDeferredValue', category: 'react', description: 'useTransition: marchează actualizări ca non-urgente. useDeferredValue: amână actualizarea unei valori. Concurrent rendering.', example: 'const [isPending, startTransition] = useTransition();\n\n// Nu blochează UI-ul în timp ce se actualizează\nstartTransition(() => {\n  setHeavyFilter(input); // actualizare non-urgentă\n});\n\n// Spinner în timp ce se procesează\n{isPending && <ActivityIndicator />}\n\n// useDeferredValue — amână o valoare\nconst deferredQuery = useDeferredValue(searchQuery);\nconst results = useMemo(() => filter(data, deferredQuery), [deferredQuery]);', related: ['hooks', 'performance'] },
  use_id: { id: 'use_id', label: 'useId & useSyncExternalStore', category: 'react', description: 'useId: ID unic stabil per componentă (SSR-safe). useSyncExternalStore: subscripție la store extern. Util pentru librării de state management.', example: 'const id = useId(); // e.g., ":r3:"\n<label htmlFor={id}>Email</label>\n<input id={id} />\n\n// useSyncExternalStore\nconst subscribe = (cb: () => void) => window.addEventListener("resize", cb);\nconst getSnapshot = () => window.innerWidth;\nconst width = useSyncExternalStore(subscribe, getSnapshot);', related: ['hooks', 'custom_hooks'] },
  context_performance: { id: 'context_performance', label: 'Context Performance', category: 'react', description: 'Context re-renderează TOȚI consumatorii la fiecare schimbare. Optimizări: split context, memoizare provider value, selectori cu useSyncExternalStore.', example: '// Context splitting\nconst UserDataContext = createContext<User | null>(null);\nconst UserActionsContext = createContext<Actions | null>(null);\n\n// Provider cu memoizare\nfunction UserProvider({ children }) {\n  const [user, setUser] = useState<User | null>(null);\n  const actions = useMemo(() => ({ login: setUser, logout: () => setUser(null) }), []);\n  return (\n    <UserActionsContext.Provider value={actions}>\n      <UserDataContext.Provider value={user}>\n        {children}\n      </UserDataContext.Provider>\n    </UserActionsContext.Provider>\n  );\n}', related: ['context', 'render_optimization'] },
  react_key: { id: 'react_key', label: 'React Keys & Reconciliation', category: 'react', description: 'Key ajută React să identifice care element s-a schimbat. key=index e rău (poate capta state greșit). key stable = ID din date.', example: '// Greșit — key = index\n{items.map((item, index) => <Item key={index} />)}\n\n// Corect — key = ID stabil\n{items.map(item => <Item key={item.id} />)}\n\n// Trick: schimbă key pentru a forța re-mount complet\n<Form key={formId} /> // formId nou = component nou\n\n// Reconciliation: React compară virtual DOM arbori\n// Element de același tip = update props\n// Element de tip diferit = unmount + mount nou', related: ['react', 'render_optimization'] },
  portals_react: { id: 'portals_react', label: 'Modal & Overlay Pattern', category: 'react', description: 'Modals cu Portal (escaping DOM hierarchy). Trap focus pentru accessibility. Escape key dismiss. BackHandler pe Android (RN).', example: 'function Modal({ visible, onClose, children }) {\n  useEffect(() => {\n    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };\n    document.addEventListener("keydown", handler);\n    return () => document.removeEventListener("keydown", handler);\n  }, [onClose]);\n\n  if (!visible) return null;\n  return createPortal(\n    <div role="dialog" aria-modal="true">\n      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)" }} />\n      <div>{children}</div>\n    </div>,\n    document.getElementById("modal-root")!\n  );\n}', related: ['react_portals', 'accessibility'] },

  // ── Node.js & Backend Extra ──
  authentication_flow: { id: 'authentication_flow', label: 'Authentication Flow Complet', category: 'backend', description: 'Register: hash + save. Login: verify hash + issue JWT/session. Refresh: rotate token. Logout: invalidate. Forgot password: token email + reset.', example: '// Register\nasync function register(email: string, password: string) {\n  const existing = await db.users.findByEmail(email);\n  if (existing) throw new ConflictError("Email deja folosit");\n  const hash = await bcrypt.hash(password, 12);\n  const user = await db.users.create({ email, password: hash });\n  return issueTokens(user);\n}\n\n// Refresh token rotation\nasync function refresh(token: string) {\n  const payload = verifyRefreshToken(token);\n  await db.revokeToken(token); // invalidate used token\n  return issueTokens(await db.users.findById(payload.userId));\n}', related: ['auth_jwt', 'hashing'] },
  multipart_upload: { id: 'multipart_upload', label: 'File Upload (Multipart)', category: 'backend', description: 'multer pentru Express file upload. Validare: tip, mărime. Stocare: local (dev) sau S3 (prod). Virus scanning pentru upload-uri neîncrezute.', example: 'import multer from "multer";\n\nconst upload = multer({\n  storage: multer.memoryStorage(),\n  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB\n  fileFilter: (_, file, cb) => {\n    const allowed = ["image/jpeg", "image/png", "image/webp"];\n    cb(null, allowed.includes(file.mimetype));\n  },\n});\n\napp.post("/upload", upload.single("image"), async (req, res) => {\n  const buffer = req.file!.buffer;\n  const url = await uploadToS3(buffer, req.file!.mimetype);\n  res.json({ url });\n});', related: ['express', 'securitate'] },
  email_sending: { id: 'email_sending', label: 'Email Sending (Nodemailer/Resend)', category: 'backend', description: 'Nodemailer cu SMTP sau Resend/SendGrid API. Template-uri HTML cu Handlebars/MJML. Queue pentru bulk sending. SPF, DKIM, DMARC pentru deliverability.', example: 'import { Resend } from "resend";\n\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nawait resend.emails.send({\n  from: "Jarvis <noreply@jarvis.ai>",\n  to: [user.email],\n  subject: "Bun venit la Jarvis!",\n  html: `\n    <h1>Salut, ${user.name}!</h1>\n    <p>Contul tău a fost creat cu succes.</p>\n    <a href="${verifyUrl}">Verifică email-ul</a>\n  `,\n});', related: ['nodejs', 'queue_systems'] },
  scheduling: { id: 'scheduling', label: 'Job Scheduling (node-cron)', category: 'backend', description: 'node-cron pentru tasks periodice pe server. Cron syntax: "* * * * *" = min, oră, zi, lună, zi_săpt. timezone support.', example: 'import cron from "node-cron";\n\n// La fiecare minut\ncron.schedule("* * * * *", async () => {\n  await processQueue();\n});\n\n// La miezul nopții\ncron.schedule("0 0 * * *", async () => {\n  await db.cleanupExpiredSessions();\n}, { timezone: "Europe/Bucharest" });\n\n// Prima zi a lunii la 9:00\ncron.schedule("0 9 1 * *", sendMonthlyReport);', related: ['nodejs', 'queue_systems'] },
  graphql_subscriptions: { id: 'graphql_subscriptions', label: 'GraphQL Subscriptions', category: 'backend', description: 'Real-time cu GraphQL Subscriptions via WebSocket. Apollo: PubSub pentru simple cases, Redis PubSub pentru multi-server.', example: 'const typeDefs = gql`\n  type Subscription {\n    messageAdded(chatId: ID!): Message!\n  }\n`;\n\nconst pubsub = new PubSub();\n\nconst resolvers = {\n  Subscription: {\n    messageAdded: {\n      subscribe: (_, { chatId }) => pubsub.asyncIterator(`MESSAGE_${chatId}`),\n    },\n  },\n  Mutation: {\n    addMessage: async (_, args) => {\n      const msg = await saveMessage(args);\n      pubsub.publish(`MESSAGE_${args.chatId}`, { messageAdded: msg });\n      return msg;\n    },\n  },\n};', related: ['graphql', 'websocket_server'] },

  // ── Database Extra ──
  mongodb_patterns: { id: 'mongodb_patterns', label: 'MongoDB & Mongoose', category: 'database', description: 'Document DB. Schema cu Mongoose. Aggregation pipeline: $match, $group, $lookup, $project. Indexuri compound, text, geospatial.', example: 'const UserSchema = new mongoose.Schema({\n  email: { type: String, required: true, unique: true, lowercase: true },\n  name: String,\n  role: { type: String, enum: ["admin","user"], default: "user" },\n  createdAt: { type: Date, default: Date.now },\n});\nUserSchema.index({ email: 1 });\n\n// Aggregation\nawait User.aggregate([\n  { $match: { role: "user" } },\n  { $group: { _id: "$role", count: { $sum: 1 }, avgAge: { $avg: "$age" } } },\n]);', related: ['sql_vs_nosql', 'transactions'] },
  database_normalization: { id: 'database_normalization', label: 'Normalizare vs Denormalizare DB', category: 'database', description: '1NF-3NF reduce redundanța. Denormalizare pentru read performance: date copiate în tabele pentru joins rapide. OLTP = normalize. OLAP/analytics = denormalize.', example: '-- Normalizat (3NF)\nusers (id, name, email)\norders (id, user_id, total)\norder_items (id, order_id, product_id, qty)\nproducts (id, name, price)\n\n-- Denormalizat (pentru analytics)\norders_report (\n  order_id, user_name, user_email,\n  product_name, qty, unit_price, total\n)\n-- Redundant dar SELECT rapid, fără JOIN-uri', related: ['postgresql', 'query_optimization'] },
  vector_database: { id: 'vector_database', label: 'Vector Database', category: 'database', description: 'Stocare și căutare vectori de embeddings. pgvector (PostgreSQL), Pinecone, Weaviate, Qdrant. Approximate Nearest Neighbor (ANN) search.', example: '-- pgvector\nCREATE EXTENSION vector;\nALTER TABLE documents ADD COLUMN embedding vector(1536);\nCREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);\n\n-- Căutare semantică\nSELECT content, 1 - (embedding <=> $1::vector) as similarity\nFROM documents\nORDER BY embedding <=> $1::vector\nLIMIT 5;\n\n-- $1 = embedding-ul query-ului (array de 1536 floats)', related: ['embeddings', 'postgresql'] },
  timeseries_db: { id: 'timeseries_db', label: 'Time-Series Data', category: 'database', description: 'Optimizat pentru date cu timestamp: metrici, IoT, financiar. TimescaleDB (PostgreSQL extension), InfluxDB. Compression, downsampling, retention policies.', example: '-- TimescaleDB\nSELECT time_bucket("5 minutes", time) AS bucket,\n       avg(temperature) AS avg_temp,\n       max(temperature) AS max_temp\nFROM sensor_readings\nWHERE time > NOW() - INTERVAL "1 day"\n  AND sensor_id = $1\nGROUP BY bucket\nORDER BY bucket;\n\n-- Retention policy — șterge automat date > 30 zile\nSELECT add_retention_policy("sensor_readings", INTERVAL "30 days");', related: ['postgresql', 'redis_patterns'] },

  // ── Testing Extra ──
  snapshot_testing: { id: 'snapshot_testing', label: 'Snapshot Testing', category: 'testing', description: 'Capturează output-ul componentei și compară cu snapshot salvat. Util pentru componente care nu trebuie să se schimbe accidental. Actualizare cu -u.', example: 'import { render } from "@testing-library/react";\n\nit("renders correctly", () => {\n  const { toJSON } = render(<MyComponent name="Ion" />);\n  expect(toJSON()).toMatchSnapshot();\n});\n\n// Actualizare snapshot:\nnpm test -- -u\n\n// React Testing Library preferat față de enzyme\nit("shows greeting", () => {\n  render(<Greeting name="Ion" />);\n  expect(screen.getByText("Salut, Ion!")).toBeInTheDocument();\n});', related: ['jest_testing', 'e2e_testing'] },
  contract_testing: { id: 'contract_testing', label: 'Contract Testing (Pact)', category: 'testing', description: 'Verifică că consumer și provider respectă același contract API. Consumer-driven. Ideal pentru microservicii. Pact.io framework.', example: '// Consumer side — definește ce aștepți\nconst interaction = {\n  uponReceiving: "a request for user 1",\n  withRequest: { method: "GET", path: "/users/1" },\n  willRespondWith: {\n    status: 200,\n    body: { id: "1", name: like("Ion") },\n  },\n};\n\n// Provider side — verifică că implementarea respectă contractul\nawait verifyProvider({\n  providerBaseUrl: "http://localhost:3000",\n  pactBrokerUrl: "https://pact.io",\n});', related: ['e2e_testing', 'microservices'] },
  load_testing: { id: 'load_testing', label: 'Load Testing (k6/Artillery)', category: 'testing', description: 'Testează comportamentul sub load. k6: JavaScript, scripting. Artillery: YAML + plugins. Metrici: RPS, latentă p50/p95/p99, error rate.', example: '// k6 script\nimport http from "k6/http";\nimport { check, sleep } from "k6";\n\nexport const options = {\n  stages: [\n    { duration: "30s", target: 10 }, // ramp up\n    { duration: "1m", target: 50 },  // load\n    { duration: "20s", target: 0 },  // ramp down\n  ],\n  thresholds: {\n    http_req_duration: ["p(95)<500"], // p95 < 500ms\n    http_req_failed: ["rate<0.01"],   // <1% erori\n  },\n};\n\nexport default function () {\n  const res = http.get("http://localhost:3000/api/health");\n  check(res, { "status 200": r => r.status === 200 });\n  sleep(1);\n}', related: ['e2e_testing', 'monitoring'] },
  mutation_testing: { id: 'mutation_testing', label: 'Mutation Testing (Stryker)', category: 'testing', description: 'Modifică codul (mutations) și verifică că testele detectează. Măsoară calitatea testelor, nu doar coverage. Stryker.js pentru JavaScript.', example: '// Stryker face automat mutations:\n// > if (a > b) schimba în if (a >= b)\n// > return x + y schimba în return x - y\n// Dacă testele NU fail-uiesc → tests slabe!\n\n// stryker.conf.json\n{\n  "mutate": ["src/**/*.ts"],\n  "testRunner": "jest",\n  "reporters": ["html", "progress"],\n  "thresholds": {\n    "high": 80,\n    "low": 60,\n    "break": 50\n  }\n}', related: ['jest_testing', 'tdd'] },

  // ── DevOps Extra ──
  secrets_management: { id: 'secrets_management', label: 'Secrets Management', category: 'devops', description: 'Secrets NICIODATĂ în cod sau git. .env în .gitignore. HashiCorp Vault, AWS Secrets Manager, Doppler. Rotire periodică. Audit access.', example: '# .gitignore\n.env\n.env.local\n.env.production\n*.key\n*.pem\n\n# Verificare că secretul nu e în git\ngit log --all --full-history -- "**/.env*"\n\n# Doppler setup\ndoppler setup\ndoppler run -- node server.js\n\n# AWS Secrets Manager\nconst secret = await secretsManager.getSecretValue({ SecretId: "prod/db/password" });', related: ['env_variables', 'ci_cd'] },
  docker_compose: { id: 'docker_compose', label: 'Docker Compose', category: 'devops', description: 'Orchestrare multi-container local. services, volumes, networks, depends_on, health checks. Override pentru development vs production.', example: 'services:\n  api:\n    build: .\n    ports: ["3000:3000"]\n    environment:\n      - DATABASE_URL=postgresql://user:pass@db:5432/mydb\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres:16\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n\nvolumes:\n  pgdata:', related: ['docker', 'kubernetes'] },
  infrastructure_monitoring: { id: 'infrastructure_monitoring', label: 'Prometheus & Grafana', category: 'devops', description: 'Prometheus: scrape metrics de la endpoints /metrics. Grafana: vizualizare dashboards. Alerting rules. prom-client pentru Node.js.', example: 'import { register, Counter, Histogram } from "prom-client";\n\nconst httpRequests = new Counter({\n  name: "http_requests_total",\n  help: "Total HTTP requests",\n  labelNames: ["method", "route", "status"],\n});\n\nconst httpDuration = new Histogram({\n  name: "http_request_duration_seconds",\n  help: "HTTP request duration",\n  labelNames: ["route"],\n});\n\napp.get("/metrics", async (req, res) => {\n  res.set("Content-Type", register.contentType);\n  res.end(await register.metrics());\n});', related: ['monitoring', 'docker'] },
  blue_green_deploy: { id: 'blue_green_deploy', label: 'Deployment Strategies', category: 'devops', description: 'Blue/Green: două environments, swap instant. Canary: rollout gradual (5% → 25% → 100%). Rolling: înlocuire pod cu pod. Feature flags pentru rollout.', example: '# Kubernetes Blue/Green\n# Blue deployment: v1.0\n# Green deployment: v1.1 (new version)\n\n# Switch traffic de la Blue la Green\nkubectl patch service myapp -p \'{"spec":{"selector":{"version":"v1.1"}}}\'\n\n# Canary cu nginx\nupstream app {\n  server app-v1 weight=95; # 95% traffic\n  server app-v2 weight=5;  # 5% canary\n}\n\n# Rollback dacă error rate creste\nkubectl rollout undo deployment/myapp', related: ['kubernetes', 'ci_cd'] },

  // ── UX & Design Extra ──
  dark_mode: { id: 'dark_mode', label: 'Dark Mode Implementation', category: 'ux', description: 'prefers-color-scheme media query (web). Appearance API React Native. CSS variables pentru theming. localStorage pentru preferință user.', example: '// React Native\nimport { useColorScheme } from "react-native";\nconst scheme = useColorScheme(); // "light" | "dark" | null\nconst isDark = scheme === "dark";\n\nconst colors = isDark ? darkColors : lightColors;\n\n// Web — CSS variables\n:root { --bg: white; --text: black; }\n[data-theme="dark"] { --bg: #0A0A0F; --text: white; }\n\n@media (prefers-color-scheme: dark) {\n  :root { --bg: #0A0A0F; --text: white; }\n}', related: ['stylesheet_rn', 'css_animations'] },
  skeleton_loading: { id: 'skeleton_loading', label: 'Skeleton Loading', category: 'ux', description: 'Placeholder animat în locul conținutului ce se încarcă. Mai bun UX decât spinner. Folosește aceeași structură ca și conținutul real.', example: '// React Native — Shimmer effect\nimport ShimmerPlaceholder from "react-native-shimmer-placeholder";\n\nfunction PostSkeleton() {\n  return (\n    <View style={{ padding: 16 }}>\n      <ShimmerPlaceholder style={{ width: "60%", height: 20, borderRadius: 4 }} />\n      <ShimmerPlaceholder style={{ width: "100%", height: 14, marginTop: 8 }} />\n      <ShimmerPlaceholder style={{ width: "80%", height: 14, marginTop: 4 }} />\n    </View>\n  );\n}', related: ['ux_patterns', 'flatlist'] },
  toast_notifications: { id: 'toast_notifications', label: 'Toast & Feedback Patterns', category: 'ux', description: 'Notificări temporare non-intruzive. Success (verde), Error (roșu), Warning (galben), Info (albastru). Auto-dismiss. react-hot-toast, react-native-toast-message.', example: 'import Toast from "react-native-toast-message";\n\n// Afișează toast\nToast.show({\n  type: "success",\n  text1: "Salvat!",\n  text2: "Fișierul a fost salvat cu succes",\n  position: "bottom",\n  visibilityTime: 3000,\n});\n\nToast.show({\n  type: "error",\n  text1: "Eroare",\n  text2: error.message,\n});\n\n// Render root\n<Toast />  // în App root', related: ['ux_patterns', 'accessibility'] },
  gesture_feedback: { id: 'gesture_feedback', label: 'Haptic Feedback', category: 'react-native', description: 'Feedback tactil pentru gesturi. expo-haptics: impact, notification, selection. Îmbunătățește UX semnificativ pe mobile.', example: 'import * as Haptics from "expo-haptics";\n\n// La apăsare button\nawait Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);\n\n// La succes\nawait Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);\n\n// La eroare\nawait Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);\n\n// La selecție (haptic light)\nawait Haptics.selectionAsync();\n\n// Util: debounce haptics pentru nu spam', related: ['react_native', 'ux_patterns'] },

  // ── AI & Prompturi Extra ──
  fine_tuning: { id: 'fine_tuning', label: 'Fine-Tuning LLM', category: 'ai', description: 'Antrenare suplimentară a unui LLM pre-antrenat pe date specifice domeniului. JSONL training format. OpenAI, HuggingFace, Axolotl. LoRA/QLoRA pentru eficiență.', example: '// Format JSONL pentru fine-tuning OpenAI\n{"messages":[{"role":"system","content":"Ești expert juridic român."},{"role":"user","content":"Ce este contractul de vânzare-cumpărare?"},{"role":"assistant","content":"Contractul de vânzare-cumpărare..."}]}\n\n// Upload și creare job\nconst file = await openai.files.create({ file, purpose: "fine-tune" });\nconst job = await openai.fineTuning.jobs.create({\n  training_file: file.id,\n  model: "gpt-4o-mini",\n});', related: ['llm_api', 'prompt_engineering'] },
  function_calling: { id: 'function_calling', label: 'Function Calling (Tool Use)', category: 'ai', description: 'LLM poate apela funcții/tools definite de tine. Structurează output-ul LLM pentru a apela API-uri, DB, acțiuni. Baza agenților AI.', example: 'const tools = [{\n  type: "function",\n  function: {\n    name: "get_weather",\n    description: "Obține vremea pentru un oraș",\n    parameters: {\n      type: "object",\n      properties: {\n        city: { type: "string", description: "Orașul" },\n        unit: { type: "string", enum: ["celsius","fahrenheit"] },\n      },\n      required: ["city"],\n    },\n  },\n}];\n\nconst response = await openai.chat.completions.create({ model, messages, tools });', related: ['llm_api', 'rag'] },
  ai_agents: { id: 'ai_agents', label: 'AI Agents & AutoGPT Pattern', category: 'ai', description: 'Agenți AI care execută task-uri multi-step autonom. ReAct pattern: Reason + Act. Tools: web search, code execution, file system. LangChain, AutoGen.', example: '// ReAct agent loop\nasync function agent(task: string) {\n  let context = task;\n  for (let i = 0; i < maxSteps; i++) {\n    const response = await llm.complete(buildReActPrompt(context));\n    const { thought, action, actionInput } = parseReAct(response);\n    if (action === "finish") return actionInput;\n    const observation = await executeTool(action, actionInput);\n    context += `\\nThought: ${thought}\\nAction: ${action}\\nObservation: ${observation}`;\n  }\n}', related: ['function_calling', 'rag'] },
  streaming_ai: { id: 'streaming_ai', label: 'AI Streaming Response', category: 'ai', description: 'Stream tokens de la LLM în loc să aștepți răspunsul complet. UX mult mai bun. Server-Sent Events sau WebSocket. Vercel AI SDK simplifică.', example: 'const stream = await openai.chat.completions.create({\n  model: "gpt-4o",\n  messages,\n  stream: true,\n});\n\nlet fullText = "";\nfor await (const chunk of stream) {\n  const delta = chunk.choices[0]?.delta?.content ?? "";\n  fullText += delta;\n  setStreamingText(prev => prev + delta); // update UI incremental\n}\nsetIsStreaming(false);', related: ['llm_api', 'websocket'] },

  // ── Web Performance Extra ──
  critical_css: { id: 'critical_css', label: 'Critical CSS & Resource Hints', category: 'performance', description: 'Critical CSS inline pentru first paint rapid. Resource hints: preload, prefetch, preconnect. DNS prefetch.', example: '<head>\n  <!-- Preload font important -->\n  <link rel="preload" href="/fonts/Inter.woff2" as="font" crossorigin>\n\n  <!-- Preconnect la API -->\n  <link rel="preconnect" href="https://api.example.com">\n\n  <!-- DNS prefetch pentru resurse externe -->\n  <link rel="dns-prefetch" href="https://cdn.example.com">\n\n  <!-- Critical CSS inline -->\n  <style>body{margin:0}header{background:#6C63FF}</style>\n\n  <!-- Non-critical CSS încărcat async -->\n  <link rel="stylesheet" href="/styles.css" media="print" onload="this.media=\'all\'">\n</head>', related: ['performance', 'web_vitals'] },
  image_optimization: { id: 'image_optimization', label: 'Image Optimization', category: 'performance', description: 'WebP/AVIF pentru imagini web. Responsive images cu srcset/sizes. Lazy loading nativ. Blur placeholder. next/image, expo-image pentru optimizare automată.', example: '// Web — next/image\nimport Image from "next/image";\n<Image src="/hero.jpg" width={800} height={600} alt="Hero" priority />\n\n// React Native — expo-image (mai rapid decât Image built-in)\nimport { Image } from "expo-image";\n<Image\n  source={{ uri: imageUrl }}\n  style={{ width: 200, height: 200 }}\n  placeholder={blurHash}\n  contentFit="cover"\n  transition={200}\n/>', related: ['performance', 'web_vitals'] },
  font_optimization: { id: 'font_optimization', label: 'Font Loading Optimization', category: 'performance', description: 'font-display: swap pentru FOUT tolerabil. Preload critical fonts. Subsetting pentru dimensiuni mai mici. expo-font pentru React Native.', example: '/* CSS font-display */\n@font-face {\n  font-family: "Inter";\n  src: url("/fonts/Inter.woff2") format("woff2");\n  font-display: swap; /* text vizibil imediat cu fallback font */\n}\n\n// Expo — preîncărcare font\nimport { useFonts } from "expo-font";\nconst [fontsLoaded] = useFonts({\n  "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),\n  "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),\n});\nif (!fontsLoaded) return null;', related: ['performance', 'css_animations'] },

  // ── Architecture Extra ──
  hexagonal_architecture: { id: 'hexagonal_architecture', label: 'Hexagonal Architecture (Ports & Adapters)', category: 'architecture', description: 'Core (domain) înconjurat de ports (interfețe) și adapters (implementări). Testare ușoară, swap de infrastructură. Varianta Clean Architecture.', example: '// Port — interfață abstractă\ninterface UserRepository {\n  findById(id: string): Promise<User | null>;\n  save(user: User): Promise<void>;\n}\n\n// Adapter — implementare concretă\nclass PostgresUserRepository implements UserRepository {\n  async findById(id: string) { /* Postgres query */ }\n  async save(user: User) { /* Postgres insert */ }\n}\n\nclass InMemoryUserRepository implements UserRepository {\n  private users = new Map<string, User>();\n  async findById(id: string) { return this.users.get(id) ?? null; }\n  async save(user: User) { this.users.set(user.id, user); }\n}', related: ['clean_architecture', 'dependency_injection'] },
  domain_driven_design: { id: 'domain_driven_design', label: 'Domain Driven Design (DDD)', category: 'architecture', description: 'Modelează codul după domeniul de business. Entități, Value Objects, Aggregates, Domain Events, Bounded Contexts, Ubiquitous Language.', example: '// Entity — identitate prin ID\nclass Order {\n  private constructor(\n    public readonly id: OrderId,\n    private status: OrderStatus,\n    private items: OrderItem[],\n  ) {}\n\n  addItem(item: OrderItem): void {\n    if (this.status !== "pending") throw new Error("Cannot modify order");\n    this.items.push(item);\n  }\n\n  place(): DomainEvent[] {\n    this.status = "placed";\n    return [new OrderPlaced(this.id)];\n  }\n}', related: ['clean_architecture', 'event_sourcing'] },
  strangler_fig: { id: 'strangler_fig', label: 'Strangler Fig Pattern', category: 'architecture', description: 'Migrare graduală de la monolith la microservicii. Noile funcționalități = microservicii. Vechile funcționalități migrate treptat. Routing la nivel de API Gateway.', example: '// API Gateway routing\nlocation / {\n  # Noua funcționalitate → microserviciu\n  location /api/orders/ { proxy_pass http://orders-service; }\n  location /api/inventory/ { proxy_pass http://inventory-service; }\n  \n  # Funcționalitate veche → monolith (temporar)\n  location / { proxy_pass http://monolith; }\n}\n\n// Pas cu pas:\n// 1. Adaugă funcționalitate nouă în microserviciu\n// 2. Rutează traficul prin proxy\n// 3. Migrează funcționalitate veche\n// 4. Monolith devine mai mic treptat', related: ['microservices', 'api_gateway'] },

  // ── Security Extra ──
  dependency_security: { id: 'dependency_security', label: 'Dependency Security', category: 'securitate', description: 'Audit regulat cu npm audit / pnpm audit. Snyk pentru vulnerability scanning. Dependabot pentru updates automate. Lock files în git. Minimizare dependențe.', example: '# Audit\npnpm audit\npnpm audit --fix\n\n# Snyk\nnpx snyk test\nnpx snyk monitor\n\n# .snyk — ignore false positives\npatch:\n  "SNYK-JS-BRACES-6838727":\n    - "@workspace/api":\n      reason: "Used in dev only"\n\n# Verificare dacă un pachet e malițios\nnpm info <package> --json | jq ".maintainers"', related: ['owasp', 'ci_cd'] },
  penetration_testing: { id: 'penetration_testing', label: 'Security Testing', category: 'securitate', description: 'OWASP ZAP pentru automated scanning. Burp Suite pentru manual testing. SQLmap pentru SQL injection. nikto pentru web server scanning.', example: '# OWASP ZAP automated scan\ndocker run -t owasp/zap2docker-stable zap-baseline.py -t https://myapp.com\n\n# SQLmap test\nsqlmap -u "https://myapp.com/api/users?id=1" --dbs\n\n# nikto web server scan\nnikto -h https://myapp.com\n\n# Headers check\ncurl -I https://myapp.com | grep -E "X-|Strict|Content-Security"\n\n# SSL/TLS check\nssllabs.com/ssltest sau\ntestssl.sh https://myapp.com', related: ['owasp', 'https_ssl'] },
  zero_trust: { id: 'zero_trust', label: 'Zero Trust Security', category: 'securitate', description: 'Niciun utilizator/sistem nu e de încredere by default. Verificare continuă. Least privilege. Segmentare rețea. mTLS între servicii. BeyondCorp model.', example: '// Principii Zero Trust:\n// 1. Verifică explicit — autentificare la fiecare request\n// 2. Least privilege — acces minim necesar\n// 3. Assume breach — acționează ca și cum ai fi compromis\n\n// mTLS între servicii\nconst tlsOptions = {\n  ca: fs.readFileSync("ca.crt"),\n  cert: fs.readFileSync("service.crt"),\n  key: fs.readFileSync("service.key"),\n  requestCert: true,\n  rejectUnauthorized: true,\n};', related: ['owasp', 'https_ssl'] },

  // ── Tools Extra ──
  postman_insomnia: { id: 'postman_insomnia', label: 'API Testing Tools', category: 'tools', description: 'Postman/Insomnia pentru testare manuală API. Colecții, environments, variabile, pre-request scripts. Newman pentru rulare în CI. REST Client extension VS Code.', example: '// REST Client — VS Code extension\n@baseUrl = http://localhost:3000\n@token = {{authToken}}\n\n### Login\n# @name login\nPOST {{baseUrl}}/api/auth/login\nContent-Type: application/json\n\n{"email": "user@test.com", "password": "password"}\n\n@authToken = {{login.response.body.token}}\n\n### Get Users (cu token automat)\nGET {{baseUrl}}/api/users\nAuthorization: Bearer {{token}}', related: ['rest_api', 'testing'] },
  make_taskfile: { id: 'make_taskfile', label: 'Makefile & Taskfile', category: 'tools', description: 'Automatizare task-uri cu Makefile (make) sau Taskfile (task). Scripts reutilizabile pentru dev, build, deploy, DB.', example: '# Makefile\n.PHONY: dev build test deploy\n\ndev:\n\tpnpm dev\n\nbuild:\n\tpnpm build\n\ntest:\n\tpnpm test --coverage\n\ndb-migrate:\n\tpnpm --filter @workspace/db run push\n\ndocker-up:\n\tdocker compose up -d\n\nclean:\n\trm -rf node_modules dist .next\n\n# Task\ntask dev   # Cauta Taskfile.yaml', related: ['ci_cd', 'npm_yarn_pnpm'] },
  code_generation: { id: 'code_generation', label: 'Code Generation & Codegen', category: 'tools', description: 'Generare cod automat din schema (Prisma, Drizzle, GraphQL, OpenAPI). Type-safe clients. Orval pentru OpenAPI → React Query hooks.', example: '// OpenAPI → TypeScript client cu Orval\n// orval.config.ts\nexport default {\n  api: {\n    input: "./openapi.yaml",\n    output: {\n      target: "./src/generated/api.ts",\n      client: "react-query",\n      schemas: "./src/generated/models",\n    },\n  },\n};\n\n// Run: npx orval\n// Generează: useGetUsers(), useCreateUser(), User type, etc.', related: ['openapi', 'drizzle_orm'] },

  // ── React Native Extras ──
  rn_styling_advanced: { id: 'rn_styling_advanced', label: 'NativeWind & Styled Components RN', category: 'react-native', description: 'NativeWind: Tailwind CSS pentru React Native. Styled Components RN: CSS-in-JS. Themed components cu ThemeContext.', example: 'import { styled } from "nativewind";\nimport { View, Text, TouchableOpacity } from "react-native";\n\nconst StyledView = styled(View);\nconst StyledText = styled(Text);\n\n// Cu NativeWind\n<View className="flex-1 bg-gray-900 p-4">\n  <Text className="text-white text-xl font-bold">{title}</Text>\n  <TouchableOpacity className="bg-violet-600 px-4 py-2 rounded-xl mt-4">\n    <Text className="text-white font-medium">Apasă</Text>\n  </TouchableOpacity>\n</View>', related: ['stylesheet_rn', 'tailwind'] },
  rn_image_handling: { id: 'rn_image_handling', label: 'Image Handling React Native', category: 'react-native', description: 'Image component: source local/uri. expo-image: caching, blur hash, progressive. FastImage pentru performanță. Resizing cu ImageManipulator.', example: 'import { Image } from "expo-image";\n\n// expo-image cu blur placeholder\n<Image\n  source={{ uri: `https://cdn.example.com/img/${id}.jpg` }}\n  placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}\n  contentFit="cover"\n  transition={300}\n  cachePolicy="memory-disk"\n  style={{ width: 200, height: 200, borderRadius: 12 }}\n/>\n\n// Resizing cu expo-image-manipulator\nimport * as ImageManipulator from "expo-image-manipulator";\nconst resized = await ImageManipulator.manipulateAsync(\n  uri,\n  [{ resize: { width: 800 } }],\n  { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }\n);', related: ['expo_camera_api', 'performance'] },
  rn_keyboard_avoidance: { id: 'rn_keyboard_avoidance', label: 'Keyboard Avoidance', category: 'react-native', description: 'KeyboardAvoidingView pentru chat/forms. Platform diferit: iOS = padding, Android = height. KeyboardAwareScrollView din librărie.', example: 'import { KeyboardAvoidingView, Platform } from "react-native";\n\n<KeyboardAvoidingView\n  style={{ flex: 1 }}\n  behavior={Platform.OS === "ios" ? "padding" : "height"}\n  keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}\n>\n  <ScrollView>\n    {/* form content */}\n  </ScrollView>\n  <View style={styles.inputBar}>\n    <TextInput />\n    <Button title="Send" />\n  </View>\n</KeyboardAvoidingView>', related: ['app_state', 'react_native'] },
  rn_performance_profiling: { id: 'rn_performance_profiling', label: 'Performance Profiling RN', category: 'react-native', description: 'React DevTools Profiler pentru re-renders. Perf Monitor built-in (shake device → Perf Monitor). Systrace pentru native thread. ram bundle pentru startup rapid.', example: '// Activează Perf Monitor\nif (__DEV__) {\n  const { PerformanceObserver } = require("perf_hooks");\n  // sau shake phone → Perf Monitor\n}\n\n// React DevTools\nimport { Profiler } from "react";\n\n<Profiler\n  id="ChatList"\n  onRender={(id, phase, duration) => {\n    if (duration > 16) console.warn(`${id} took ${duration}ms (${phase})`);\n  }}\n>\n  <ChatList />\n</Profiler>', related: ['flatlist_performance', 'memory_management'] },
  rn_animations_advanced: { id: 'rn_animations_advanced', label: 'Animații Complexe (Skia/Lottie)', category: 'react-native', description: 'React Native Skia: 2D graphics. Lottie: animații JSON din After Effects. Rive: animații interactive. Moti: wrapper simplu peste Reanimated.', example: 'import LottieView from "lottie-react-native";\n\n// Lottie animation\n<LottieView\n  source={require("./animations/success.json")}\n  style={{ width: 200, height: 200 }}\n  autoPlay\n  loop={false}\n  onAnimationFinish={() => onSuccess()}\n/>\n\n// Rive interactive animation\nimport Rive from "rive-react-native";\n<Rive\n  resourceName="car"\n  stateMachineName="car_driving"\n  onStateChange={(sm, state) => setCarState(state)}\n/>', related: ['reanimated', 'animated_rn'] },

  // ── Extra Concepts ──
  object_spread: { id: 'object_spread', label: 'Object Cloning & Merging', category: 'javascript', description: 'Shallow clone cu spread/Object.assign. Deep clone cu structuredClone sau JSON parse/stringify (limitări). Immer pentru mutații imutabile.', example: 'const original = { a: 1, nested: { b: 2 } };\n\n// Shallow clone (nested e tot referință!)\nconst shallow = { ...original };\n\n// Deep clone (modern, safe)\nconst deep = structuredClone(original);\n\n// Deep clone (fallback)\nconst deep2 = JSON.parse(JSON.stringify(original)); // pierde Date, functions\n\n// Immer pentru update imutabil complex\nimport produce from "immer";\nconst next = produce(state, draft => {\n  draft.users[0].name = "Ion"; // mutare directă OK în draft\n});', related: ['spread', 'immutability'] },
  array_sorting: { id: 'array_sorting', label: 'Sortare Arrays', category: 'javascript', description: '.sort() in-place, comparator custom. Stabil în modern JS (Chrome 70+). toSorted() = versiune imutabilă (ES2023).', example: 'const nums = [3, 1, 4, 1, 5, 9, 2];\nnums.sort((a, b) => a - b); // ASC numeric\nnums.sort((a, b) => b - a); // DESC numeric\n\n// String sort\nnames.sort((a, b) => a.localeCompare(b, "ro"));\n\n// Objects sort\nusers.sort((a, b) => a.name.localeCompare(b.name));\nusers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());\n\n// Imutabil (ES2023)\nconst sorted = [...arr].sort((a, b) => a - b);\nconst sorted2 = arr.toSorted((a, b) => a - b);', related: ['array_methods', 'sortare'] },
  callback_hell: { id: 'callback_hell', label: 'Callback Hell & Solutions', category: 'javascript', description: 'Callback hell = nested callbacks greu de citit. Soluții: Promises, async/await, named functions, modularizare.', example: '// Callback hell\ngetUser(id, (user) => {\n  getPosts(user.id, (posts) => {\n    getComments(posts[0].id, (comments) => {\n      // nested 4 nivele... imposibil de menținut\n    });\n  });\n});\n\n// Async/await — mult mai clar\nasync function loadData(id: string) {\n  const user = await getUser(id);\n  const posts = await getPosts(user.id);\n  const comments = await getComments(posts[0].id);\n  return { user, posts, comments };\n}', related: ['async_await', 'promise'] },
  error_types: { id: 'error_types', label: 'Error Types JavaScript', category: 'javascript', description: 'TypeError, RangeError, ReferenceError, SyntaxError, URIError, EvalError. Custom errors prin extindere Error. instanceof pentru catch specific.', example: 'class AppError extends Error {\n  constructor(\n    message: string,\n    public readonly code: string,\n    public readonly statusCode: number = 500,\n  ) {\n    super(message);\n    this.name = "AppError";\n  }\n}\n\nclass ValidationError extends AppError {\n  constructor(message: string, public readonly field: string) {\n    super(message, "VALIDATION_ERROR", 400);\n    this.name = "ValidationError";\n  }\n}\n\ntry { /* ... */ }\ncatch (e) {\n  if (e instanceof ValidationError) { /* 400 */ }\n  else if (e instanceof AppError) { /* known error */ }\n  else throw e; // unknown, re-throw\n}', related: ['error_handling', 'typescript_basics'] },
  functional_arrays: { id: 'functional_arrays', label: 'Chaining Array Methods', category: 'javascript', description: 'Lanțuri de map/filter/reduce pentru transformări expresive. Fiecare returnează array nou. Performanță: consider single loop pentru multiple operații pe array mare.', example: 'const activeUserEmails = users\n  .filter(u => u.isActive && u.emailVerified)\n  .map(u => u.email.toLowerCase())\n  .filter(email => email.endsWith(".ro"))\n  .sort();\n\n// Performant — single loop cu reduce\nconst { emails, names } = users.reduce(\n  (acc, u) => {\n    if (u.isActive) {\n      acc.emails.push(u.email);\n      acc.names.push(u.name);\n    }\n    return acc;\n  },\n  { emails: [] as string[], names: [] as string[] }\n);', related: ['map_filter_reduce', 'pure_functions'] },

  // ── 500th Concept Area — Finalizare ──
  package_json: { id: 'package_json', label: 'package.json Anatomy', category: 'tools', description: 'dependencies vs devDependencies vs peerDependencies. scripts pentru automatizare. engines pentru versiuni. exports pentru package exports.', example: '{\n  "name": "@myorg/ui",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "test": "vitest",\n    "lint": "eslint src --ext ts,tsx"\n  },\n  "dependencies": { "react": "^18.0.0" },\n  "devDependencies": { "typescript": "^5.0.0" },\n  "peerDependencies": { "react": ">=17.0.0" },\n  "exports": {\n    ".": "./dist/index.js",\n    "./types": "./dist/types.d.ts"\n  },\n  "engines": { "node": ">=18" }\n}', related: ['npm_yarn_pnpm', 'vite'] },
  semantic_versioning: { id: 'semantic_versioning', label: 'Semantic Versioning (SemVer)', category: 'tools', description: 'MAJOR.MINOR.PATCH. ^ = acceptă minor+patch updates. ~ = acceptă doar patch. exact = pin exact. Breaking change = major bump.', example: '// SemVer\n// 1.2.3 = MAJOR.MINOR.PATCH\n// MAJOR: breaking changes\n// MINOR: new features, backward compatible\n// PATCH: bug fixes, backward compatible\n\n// package.json ranges\n"^1.2.3" // acceptă 1.x.x dar nu 2.0.0\n"~1.2.3" // acceptă 1.2.x dar nu 1.3.0\n"1.2.3"  // exact această versiune\n">= 1.2 < 2.0" // range\n"*"      // orice versiune (periculos!)\n\n// pnpm/npm — updatare\npnpm update react   // la ultima minor\npnpm update react@2 // la major 2', related: ['npm_yarn_pnpm', 'ci_cd'] },
  lerna: { id: 'lerna', label: 'Monorepo Versioning (Changesets)', category: 'tools', description: 'Changesets: versionare și publish independentă pentru pachete monorepo. changeset add → changelog automat → version bump → publish.', example: '# Workflow cu @changesets/cli\n# 1. Developer adaugă changeset\nnpx changeset\n# (selectează pachete afectate, bump type, descriere)\n\n# 2. CI la merge: apply changesets\nnpx changeset version\n# Bumpa versiuni + actualizează CHANGELOG.md\n\n# 3. Publish\nnpx changeset publish\n# Publică pe npm toate pachetele cu versiune nouă', related: ['monorepo', 'semantic_versioning'] },
  ab_testing: { id: 'ab_testing', label: 'A/B Testing', category: 'architecture', description: 'Testare a două variante pe utilizatori reali. Split pe userId/sessionId. Metrici: conversie, engagement, revenue. Statistical significance.', example: 'function getVariant(userId: string, experimentName: string): "A" | "B" {\n  // Hash deterministic — același user = același variant\n  const hash = cyrb53(`${userId}:${experimentName}`);\n  return hash % 100 < 50 ? "A" : "B";\n}\n\n// Tracking\nanalyticsEvent("experiment_viewed", {\n  experiment: "checkout_redesign",\n  variant: getVariant(userId, "checkout_redesign"),\n  userId,\n});\n\n// Render\nconst variant = getVariant(userId, "checkout_redesign");\nreturn variant === "A" ? <OldCheckout /> : <NewCheckout />;', related: ['feature_flags', 'monitoring'] },
  progressive_enhancement: { id: 'progressive_enhancement', label: 'Progressive Enhancement', category: 'web', description: 'Baza = HTML funcțional. Enhancement = CSS + JS adăugate. Graceful degradation invers. Offline first = progressive enhancement pentru mobile.', example: '// HTML semantic bun fără JS\n<form action="/search" method="get">\n  <input name="q" type="search" />\n  <button type="submit">Caută</button>\n</form>\n\n// Enhancement cu JS — SPA experience\ndocument.querySelector("form").addEventListener("submit", async (e) => {\n  e.preventDefault();\n  const results = await searchAPI(new FormData(e.target).get("q"));\n  renderResults(results);\n});\n// Funcționează și fără JS (form submit normal)', related: ['pwa', 'accessibility'] },
  micro_frontends: { id: 'micro_frontends', label: 'Micro-Frontends', category: 'architecture', description: 'Împarte frontendele mari în aplicații mai mici, independente. Module Federation (Webpack 5), iframes, single-spa. Fiecare echipă deployază independent.', example: '// Module Federation — webpack.config.js (host)\nnew ModuleFederationPlugin({\n  name: "host",\n  remotes: {\n    checkout: "checkout@https://checkout.example.com/remoteEntry.js",\n    catalog: "catalog@https://catalog.example.com/remoteEntry.js",\n  },\n});\n\n// Lazy load remote\nconst Checkout = lazy(() => import("checkout/CheckoutPage"));\nconst Catalog = lazy(() => import("catalog/ProductList"));\n\n<Suspense fallback={<Spinner />}>\n  <Checkout />\n</Suspense>', related: ['spa_architecture', 'code_splitting'] },
  websocket_patterns: { id: 'websocket_patterns', label: 'Real-Time Patterns', category: 'backend', description: 'Presence detection, typing indicators, optimistic UI, conflict resolution. Redis Pub/Sub pentru multi-server sync. Heartbeat + reconnect automat.', example: 'class RealtimeClient {\n  private ws: WebSocket | null = null;\n  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;\n\n  connect(url: string) {\n    this.ws = new WebSocket(url);\n    this.ws.onclose = () => this.scheduleReconnect(url);\n    this.ws.onerror = () => this.ws?.close();\n    // Heartbeat\n    const ping = setInterval(() => this.ws?.send("ping"), 30000);\n    this.ws.onclose = () => { clearInterval(ping); this.scheduleReconnect(url); };\n  }\n\n  private scheduleReconnect(url: string) {\n    this.reconnectTimer = setTimeout(() => this.connect(url), 3000);\n  }\n}', related: ['websocket', 'websocket_server'] },

  // ── Batch Final — 170 concepte compacte ──
  // JavaScript Complete
  iife: { id: 'iife', label: 'IIFE (Immediately Invoked Function)', category: 'javascript', description: 'Funcție executată imediat după definire. Util pentru izolare scope, evitare poluare globală. Pattern clasic înainte de module.', example: '(function() {\n  const private = "nu e accesibil global";\n  console.log("executat imediat!");\n})();\n\n// Arrow IIFE\n(() => {\n  // codul tău izolat\n})();\n\n// Cu parametri\n(function(window, document) {\n  // cod jQuery-style\n})(window, document);', related: ['closure', 'scope'] },
  comma_operator: { id: 'comma_operator', label: 'Operatori Bitwise', category: 'javascript', description: 'Operatori la nivel de bit: & (AND), | (OR), ^ (XOR), ~ (NOT), << (left shift), >> (right shift), >>> (unsigned right shift). Util pentru flags, permisiuni.', example: 'const READ = 1; // 001\nconst WRITE = 2; // 010\nconst EXEC = 4;  // 100\n\nconst permissions = READ | WRITE; // 011 = 3\nconst canRead = !!(permissions & READ);  // true\nconst canWrite = !!(permissions & WRITE); // true\nconst canExec = !!(permissions & EXEC);  // false\n\n// Adaugă permisiune\nconst newPerms = permissions | EXEC;\n// Elimină permisiune\nconst noWrite = permissions & ~WRITE;', related: ['variabila', 'typescript_basics'] },
  label_statement: { id: 'label_statement', label: 'Labeled Statements & break/continue', category: 'javascript', description: 'Label pentru break/continue din loop-uri nested. Util rar dar important de cunoscut. Alternative: funcție separată, flag boolean.', example: 'outer: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (j === 1) continue outer; // sare la outer loop\n    if (i === 2) break outer;    // iese din ambele loops\n    console.log(i, j);\n  }\n}', related: ['functie', 'recursivitate'] },
  with_statement: { id: 'with_statement', label: 'Async Iteration (for await...of)', category: 'javascript', description: 'for await...of pentru iterarea async iterables. Streams, async generators, paginated APIs.', example: 'async function processStream(stream: AsyncIterable<Buffer>) {\n  for await (const chunk of stream) {\n    process(chunk);\n  }\n}\n\n// Async generator\nasync function* paginate(url: string) {\n  let cursor: string | null = null;\n  do {\n    const res = await fetch(`${url}?cursor=${cursor ?? ""}`);\n    const { items, nextCursor } = await res.json();\n    yield* items;\n    cursor = nextCursor;\n  } while (cursor);\n}\n\nfor await (const item of paginate("/api/items")) { /* */ }', related: ['async_await', 'iterators_generators'] },
  nullish_assign: { id: 'nullish_assign', label: 'Logical Assignment Operators', category: 'javascript', description: '??= (asignează dacă null/undefined), ||= (asignează dacă falsy), &&= (asignează dacă truthy). ES2021.', example: 'let a = null;\na ??= "default"; // a = "default"\n\nlet b = "";\nb ||= "fallback"; // b = "fallback" (e falsy)\n\nlet c = { count: 0 };\nc &&= { ...c, count: c.count + 1 }; // execută dacă c e truthy\n\n// Util pentru inițializare lazy\ncache.data ??= fetchData(); // fetch doar dacă cache e gol', related: ['null_undefined', 'logical_operators'] },
  promise_all: { id: 'promise_all', label: 'Promise Combinators', category: 'javascript', description: 'Promise.all (toate sau fail), Promise.allSettled (toate, indiferent), Promise.race (primul), Promise.any (primul success).', example: '// All — fail-fast\nconst [user, posts] = await Promise.all([getUser(id), getPosts(id)]);\n\n// AllSettled — toate rezultatele\nconst results = await Promise.allSettled([api1(), api2(), api3()]);\nresults.forEach(r => {\n  if (r.status === "fulfilled") use(r.value);\n  else logError(r.reason);\n});\n\n// Race — timeout pattern\nconst data = await Promise.race([\n  fetchData(),\n  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))\n]);', related: ['async_await', 'promise'] },
  structured_clone: { id: 'structured_clone', label: 'structuredClone & Transferable', category: 'javascript', description: 'structuredClone: deep clone nativ, suportă Date, Map, Set, ArrayBuffer. Transferable: transferă ownership de memorie la Web Workers fără copiere.', example: 'const original = {\n  date: new Date(),\n  map: new Map([["a", 1]]),\n  set: new Set([1, 2, 3]),\n  nested: { arr: [1, 2] },\n};\nconst clone = structuredClone(original);\n// Spread și JSON.parse nu ar funcționa corect\n\n// Transferable (Web Workers)\nconst buffer = new ArrayBuffer(1024);\nworker.postMessage({ buffer }, [buffer]); // transfer, nu copiere', related: ['object_spread', 'web_workers'] },
  // TypeScript Extra
  satisfies_op: { id: 'satisfies_op', label: 'Operator satisfies & using', category: 'typescript', description: 'satisfies: verifică tipul fără a-l lărgi (TS 4.9). using: Explicit Resource Management (TS 5.2) — cleanup automat.', example: 'const palette = {\n  red: [255, 0, 0],\n  green: "#00ff00",\n} satisfies Record<string, string | number[]>;\n// palette.red e number[] (nu string | number[])\n// palette.green e string\n\n// using — cleanup automat\nfunction* createDB() {\n  const db = openConnection();\n  try { yield db; }\n  finally { db.close(); }\n}\n\nawait using db = openDatabase(); // close() apelat automat', related: ['as_const', 'typescript_basics'] },
  variance: { id: 'variance', label: 'Covariance & Contravariance', category: 'typescript', description: 'Covariant: subtipul poate fi folosit. Contravariant: supertipul poate fi folosit. Function params = contravariant, return = covariant.', example: 'class Animal { breathe() {} }\nclass Dog extends Animal { bark() {} }\n\n// Covariant return type — OK\nconst producer: () => Animal = (): Dog => new Dog();\n\n// Contravariant param — OK\nconst handler: (a: Dog) => void = (a: Animal) => a.breathe();\n\n// TypeScript — in/out variances\ntype Provider<out T> = () => T; // covariant\ntype Consumer<in T> = (x: T) => void; // contravariant', related: ['generics', 'inheritance'] },
  declaration_files: { id: 'declaration_files', label: 'Declaration Files (.d.ts)', category: 'typescript', description: '.d.ts = tipuri pentru librării fără TypeScript. DefinitelyTyped (@types/). Creare manuală pentru librării fără tipuri. declare module.', example: '// mylib.d.ts\ndeclare module "mylib" {\n  export function greet(name: string): string;\n  export interface Config {\n    timeout?: number;\n    baseUrl: string;\n  }\n  export class Client {\n    constructor(config: Config);\n    request(path: string): Promise<unknown>;\n  }\n}\n\n// Instalare tipuri\nnpm i -D @types/node @types/react', related: ['typescript_basics', 'module_system'] },
  // React Extra
  react_18: { id: 'react_18', label: 'React 18 Features', category: 'react', description: 'Concurrent rendering, automatic batching, useTransition, useDeferredValue, useId, Suspense improvements. Server Components (RSC) în Next.js.', example: '// Automatic batching React 18\n// React 17: batching doar în event handlers\n// React 18: batching și în async callbacks\n\nsetTimeout(() => {\n  setCount(c => c + 1);\n  setFlag(f => !f);\n  // React 18: un singur re-render!\n  // React 17: două re-renders\n}, 1000);\n\n// Server Components (Next.js App Router)\nasync function Page() {\n  const data = await fetch("https://api.example.com/data"); // direct pe server!\n  return <DataDisplay data={await data.json()} />;\n}', related: ['suspense_react', 'use_transition'] },
  react_server_components: { id: 'react_server_components', label: 'React Server Components (RSC)', category: 'react', description: 'Componente care rulează pe server. Zero bundle size, acces direct la DB, async/await. "use client" pentru client-side interactivity.', example: '// app/page.tsx — Server Component by default\nasync function ProductPage({ params }: { params: { id: string } }) {\n  const product = await db.products.findById(params.id); // server-side!\n  return (\n    <div>\n      <ProductDetails product={product} />\n      <AddToCartButton productId={product.id} /> {/* "use client" */}\n    </div>\n  );\n}\n\n// AddToCartButton.tsx — Client Component\n"use client";\nexport function AddToCartButton({ productId }: Props) {\n  const [added, setAdded] = useState(false);\n  return <button onClick={() => addToCart(productId)}>Add</button>;\n}', related: ['react_18', 'spa_architecture'] },
  react_forms: { id: 'react_forms', label: 'Forms în React (React Hook Form)', category: 'react', description: 'React Hook Form: uncontrolled + validation. Zod integration via @hookform/resolvers. Watch, setValue, trigger, formState.', example: 'import { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";\n\nconst schema = z.object({ email: z.string().email(), password: z.string().min(8) });\ntype FormData = z.infer<typeof schema>;\n\nconst { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({\n  resolver: zodResolver(schema),\n});\n\nconst onSubmit = handleSubmit(async (data) => {\n  await login(data);\n});\n\n<form onSubmit={onSubmit}>\n  <input {...register("email")} />\n  {errors.email && <span>{errors.email.message}</span>}\n</form>', related: ['validation_zod', 'custom_hooks'] },
  react_table: { id: 'react_table', label: 'TanStack Table', category: 'react', description: 'Headless table library. Sorting, filtering, pagination, virtualization, column resize. Cel mai flexibil, orice UI.', example: 'import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";\n\nconst table = useReactTable({\n  data: users,\n  columns: [\n    { accessorKey: "name", header: "Nume", enableSorting: true },\n    { accessorKey: "email", header: "Email" },\n    { id: "actions", cell: ({ row }) => <Actions user={row.original} /> },\n  ],\n  getCoreRowModel: getCoreRowModel(),\n  getSortedRowModel: getSortedRowModel(),\n});\n\nreturn <table>{table.getRowModel().rows.map(row => <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</table>;', related: ['flatlist', 'pagination'] },
  framer_motion: { id: 'framer_motion', label: 'Framer Motion', category: 'react', description: 'Librărie de animații pentru React. motion components, variants, AnimatePresence, layout animations, gestures, useMotionValue.', example: 'import { motion, AnimatePresence } from "framer-motion";\n\n<motion.div\n  initial={{ opacity: 0, y: 20 }}\n  animate={{ opacity: 1, y: 0 }}\n  exit={{ opacity: 0, y: -20 }}\n  transition={{ duration: 0.3 }}\n  whileHover={{ scale: 1.05 }}\n  whileTap={{ scale: 0.95 }}\n>\n  Content\n</motion.div>\n\n<AnimatePresence>\n  {isVisible && <motion.div key="modal" /* ... *//>}\n</AnimatePresence>', related: ['css_animations', 'reanimated'] },
  // Backend Extra
  graphql_federation: { id: 'graphql_federation', label: 'GraphQL Federation', category: 'backend', description: 'Schema unificată din multiple servicii GraphQL. Apollo Federation: @key, @extends, @external, @requires. Supergraph = suma subgraph-urilor.', example: '# orders-service schema\ntype Order @key(fields: "id") {\n  id: ID!\n  total: Float!\n  user: User! @provides(fields: "email")\n}\n\nextend type User @key(fields: "id") {\n  id: ID! @external\n  email: String @external\n  orders: [Order!]!\n}\n\n# Apollo Router / Gateway unică\nnpx apollo-gateway start', related: ['graphql', 'microservices'] },
  http2_http3: { id: 'http2_http3', label: 'HTTP/2 & HTTP/3', category: 'backend', description: 'HTTP/2: multiplexing (mai multe requesturi pe o conexiune), server push, header compression. HTTP/3: UDP + QUIC, 0-RTT, mai bun pe conexiuni slabe.', example: '// HTTP/2 în Node.js\nconst http2 = require("http2");\nconst fs = require("fs");\n\nconst server = http2.createSecureServer({\n  key: fs.readFileSync("server.key"),\n  cert: fs.readFileSync("server.crt"),\n});\n\nserver.on("stream", (stream, headers) => {\n  // Server Push\n  stream.pushStream({ ":path": "/style.css" }, (err, pushStream) => {\n    pushStream.end(fs.readFileSync("style.css"));\n  });\n  stream.respond({ "content-type": "text/html", ":status": 200 });\n  stream.end("<html>Hello</html>");\n});', related: ['nginx', 'performance'] },
  api_mocking: { id: 'api_mocking', label: 'API Mocking (MSW)', category: 'testing', description: 'Mock Service Worker: interceptează requesturi la nivel de Service Worker. Funcționează și în browser, și în Node. Ideal pentru tests + development.', example: 'import { http, HttpResponse } from "msw";\nimport { setupServer } from "msw/node";\n\nconst server = setupServer(\n  http.get("/api/users", () => {\n    return HttpResponse.json([\n      { id: "1", name: "Ion", email: "ion@test.com" }\n    ]);\n  }),\n  http.post("/api/users", async ({ request }) => {\n    const body = await request.json();\n    return HttpResponse.json({ id: "2", ...body }, { status: 201 });\n  }),\n);\n\nbeforeAll(() => server.listen());\nafterEach(() => server.resetHandlers());\nafterAll(() => server.close());', related: ['mocking', 'jest_testing'] },
  test_containers: { id: 'test_containers', label: 'Test Containers', category: 'testing', description: 'Rulează containere Docker real în tests. PostgreSQL, Redis, MongoDB reale în loc de mock. Integration tests fidele.', example: 'import { PostgreSqlContainer } from "@testcontainers/postgresql";\n\ndescribe("UserRepository", () => {\n  let container: StartedPostgreSqlContainer;\n  let db: typeof import("../db");\n\n  beforeAll(async () => {\n    container = await new PostgreSqlContainer().start();\n    process.env.DATABASE_URL = container.getConnectionUri();\n    db = await import("../db");\n    await db.migrate();\n  });\n\n  afterAll(() => container.stop());\n\n  it("creates user", async () => {\n    const user = await db.users.create({ email: "test@test.com" });\n    expect(user.id).toBeDefined();\n  });\n});', related: ['jest_testing', 'docker'] },
  vitest: { id: 'vitest', label: 'Vitest', category: 'testing', description: 'Alternativă la Jest, optimizată pentru Vite. Compatibil cu API Jest. ESM first, TypeScript nativ. In-source testing, benchmarks, coverage cu v8.', example: 'import { describe, it, expect, vi, beforeEach } from "vitest";\n\ndescribe("Calculator", () => {\n  beforeEach(() => vi.clearAllMocks());\n  \n  it("adds numbers", () => {\n    expect(add(1, 2)).toBe(3);\n  });\n  \n  it("handles async", async () => {\n    const spy = vi.spyOn(api, "fetchUser").mockResolvedValue({ id: "1" });\n    const user = await getUser("1");\n    expect(spy).toHaveBeenCalledWith("1");\n    expect(user.id).toBe("1");\n  });\n});\n\n// In-source test\nif (import.meta.vitest) {\n  const { test, expect } = import.meta.vitest;\n  test("add", () => expect(add(1,2)).toBe(3));\n}', related: ['jest_testing', 'vite'] },
  // DevOps Extra
  pm2: { id: 'pm2', label: 'PM2 Process Manager', category: 'devops', description: 'Process manager pentru Node.js în producție. Cluster mode, zero-downtime reload, monitoring, logs, startup script.', example: '# pm2.config.js\nmodule.exports = {\n  apps: [{\n    name: "api",\n    script: "dist/index.js",\n    instances: "max", // cluster mode\n    exec_mode: "cluster",\n    env_production: {\n      NODE_ENV: "production",\n      PORT: 3000,\n    },\n    max_restarts: 10,\n    exp_backoff_restart_delay: 100,\n  }]\n};\n\npm2 start pm2.config.js --env production\npm2 reload api          # zero-downtime\npm2 logs api --lines 100\npm2 monit', related: ['nodejs', 'docker'] },
  dns: { id: 'dns', label: 'DNS & Domain Configuration', category: 'devops', description: 'A record: IP direct. CNAME: alias. MX: email. TXT: verificare, SPF, DKIM. NS: nameservers. TTL: Time To Live. Propagare 24-48h.', example: '# DNS Records exemple\n# A record — mapare domeniu la IP\nmyapp.com.    A    1.2.3.4\n\n# CNAME — alias\nwww.myapp.com.  CNAME  myapp.com.\napi.myapp.com.  CNAME  myapp-api.example.com.\n\n# MX — email\nmyapp.com.  MX  10  mail.myapp.com.\n\n# TXT — verificare Google Search Console\nmyapp.com.  TXT  "google-site-verification=abc123"\n\n# Verificare propagare\nnslookup myapp.com\ndig myapp.com +trace', related: ['nginx', 'https_ssl'] },
  load_balancing: { id: 'load_balancing', label: 'Load Balancing Strategies', category: 'devops', description: 'Round Robin (default), Least Connections, IP Hash (sticky sessions), Weighted. Health checks pentru excludere instanțe unhealthy.', example: '# nginx load balancing\nupstream api_servers {\n  least_conn; # trimite la cel cu conexiuni mai puține\n  server app1:3000 weight=3; # primește 3x mai mult trafic\n  server app2:3000;\n  server app3:3000 backup; # folosit doar când restul down\n\n  keepalive 32; # conexiuni persistente\n\n  server app4:3000 max_fails=3 fail_timeout=30s;\n}', related: ['nginx', 'kubernetes'] },
  container_registry: { id: 'container_registry', label: 'Container Registry', category: 'devops', description: 'Stocare imagini Docker. DockerHub, GitHub Container Registry (ghcr.io), AWS ECR, Google Artifact Registry. Tags: latest, semver, commit SHA.', example: '# Build și push la GHCR\ndocker build -t ghcr.io/myorg/myapp:v1.2.0 .\ndocker push ghcr.io/myorg/myapp:v1.2.0\ndocker tag ghcr.io/myorg/myapp:v1.2.0 ghcr.io/myorg/myapp:latest\ndocker push ghcr.io/myorg/myapp:latest\n\n# GitHub Actions — auto build+push\n- uses: docker/build-push-action@v5\n  with:\n    context: .\n    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}\n    push: true', related: ['docker', 'ci_cd'] },
  // Architecture Extra
  event_driven: { id: 'event_driven', label: 'Event-Driven Architecture', category: 'architecture', description: 'Serviciile comunică prin events. Producers emit events, consumers reacționează. Kafka/RabbitMQ ca message broker. Loose coupling, scalabilitate.', example: '// Producer\nawait kafka.produce({\n  topic: "order.created",\n  messages: [{\n    key: order.id,\n    value: JSON.stringify(order),\n    headers: { correlationId: requestId },\n  }],\n});\n\n// Consumer\nconst consumer = kafka.consumer({ groupId: "email-service" });\nawait consumer.subscribe({ topics: ["order.created"] });\nawait consumer.run({\n  eachMessage: async ({ message }) => {\n    const order = JSON.parse(message.value!.toString());\n    await sendOrderConfirmation(order);\n  },\n});', related: ['microservices', 'queue_systems'] },
  idempotency: { id: 'idempotency', label: 'Idempotency', category: 'architecture', description: 'Operație idempotentă: executată de N ori = același rezultat ca o dată. Important pentru retry logic. Idempotency-Key header pentru API-uri.', example: '// Server: Idempotency-Key pentru payment\napp.post("/api/payments", async (req, res) => {\n  const idempotencyKey = req.headers["idempotency-key"];\n  if (!idempotencyKey) return res.status(400).json({ error: "Idempotency-Key required" });\n  \n  // Verifică dacă am procesat deja\n  const existing = await redis.get(`payment:${idempotencyKey}`);\n  if (existing) return res.json(JSON.parse(existing)); // returnează același result\n  \n  const payment = await processPayment(req.body);\n  await redis.setex(`payment:${idempotencyKey}`, 86400, JSON.stringify(payment));\n  res.json(payment);\n});', related: ['api_design', 'transactions'] },
  graceful_shutdown: { id: 'graceful_shutdown', label: 'Graceful Shutdown', category: 'backend', description: 'La SIGTERM: nu mai accepta requesturi noi, finalizează cele în curs, închide conexiuni DB. Esențial în Kubernetes (rolling updates).', example: 'const server = app.listen(PORT);\n\nprocess.on("SIGTERM", async () => {\n  console.log("SIGTERM received, shutting down gracefully...");\n  \n  server.close(async () => {\n    await db.$pool.end(); // închide pool DB\n    await redis.quit();    // închide Redis\n    console.log("Graceful shutdown complete");\n    process.exit(0);\n  });\n  \n  // Force kill după 30s\n  setTimeout(() => process.exit(1), 30000);\n});', related: ['nodejs', 'kubernetes'] },
  twelve_factor: { id: 'twelve_factor', label: '12-Factor App', category: 'architecture', description: 'Metodologie pentru aplicații cloud-native: codebase, dependencies, config în env, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, admin processes.', example: '// Factor 3: Config în environment variables\nconst config = {\n  db: process.env.DATABASE_URL!,\n  port: parseInt(process.env.PORT ?? "3000"),\n  logLevel: process.env.LOG_LEVEL ?? "info",\n};\n\n// Factor 11: Logs ca streams\nconsole.log(JSON.stringify({ level: "info", message: "Server started", port: config.port }));\n\n// Factor 8: Concurrency (cluster/containers)\n// Factor 9: Disposability (fast startup, graceful shutdown)', related: ['clean_architecture', 'devops'] },
  // Algorithm Extra
  prefix_sum: { id: 'prefix_sum', label: 'Prefix Sum & Difference Array', category: 'algoritmi', description: 'Prefix sum: precalculează suma cumulativă pentru range queries O(1). Difference array: range updates O(1).', example: '// Prefix sum\nfunction buildPrefix(arr: number[]): number[] {\n  const prefix = [0];\n  for (const n of arr) prefix.push(prefix.at(-1)! + n);\n  return prefix;\n}\n\nfunction rangeSum(prefix: number[], l: number, r: number): number {\n  return prefix[r + 1] - prefix[l];\n}\n\nconst arr = [1, 2, 3, 4, 5];\nconst prefix = buildPrefix(arr);\nrangeSum(prefix, 1, 3); // 9 (2+3+4)', related: ['sliding_window', 'dynamic_programming'] },
  two_pointers: { id: 'two_pointers', label: 'Two Pointers Technique', category: 'algoritmi', description: 'Doi pointeri care se mișcă prin array. Opposite ends (sorted array), same direction (sliding window). Reduce O(n²) la O(n).', example: '// Two sum în array sortat\nfunction twoSum(sorted: number[], target: number): [number, number] | null {\n  let left = 0, right = sorted.length - 1;\n  while (left < right) {\n    const sum = sorted[left] + sorted[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return null;\n}\n\n// Remove duplicates in-place\nfunction removeDuplicates(arr: number[]): number {\n  let k = 0;\n  for (let i = 1; i < arr.length; i++)\n    if (arr[i] !== arr[k]) arr[++k] = arr[i];\n  return k + 1;\n}', related: ['sliding_window', 'binary_search'] },
  topological_sort: { id: 'topological_sort', label: 'Topological Sort', category: 'algoritmi', description: 'Ordonare noduri graf aciclic (DAG) astfel încât fiecare nod vine înaintea dependențelor. Kahn\'s algorithm (BFS) sau DFS. Uzual: task scheduling, build order.', example: 'function topoSort(numCourses: number, prerequisites: number[][]): number[] {\n  const inDegree = new Array(numCourses).fill(0);\n  const adj = Array.from({length: numCourses}, () => [] as number[]);\n  for (const [a, b] of prerequisites) { adj[b].push(a); inDegree[a]++; }\n  const queue = inDegree.map((d, i) => d === 0 ? i : -1).filter(i => i >= 0);\n  const result: number[] = [];\n  while (queue.length) {\n    const node = queue.shift()!; result.push(node);\n    for (const next of adj[node]) { if (--inDegree[next] === 0) queue.push(next); }\n  }\n  return result.length === numCourses ? result : [];\n}', related: ['graph_algorithms', 'bfs'] },
  bfs: { id: 'bfs', label: 'BFS Applications', category: 'algoritmi', description: 'Shortest path în grafuri neponderate, level-order traversal, connected components, bipartite check, multi-source BFS.', example: '// Shortest path în matrice\nfunction shortestPath(grid: number[][], start: [number,number], end: [number,number]): number {\n  const [rows, cols] = [grid.length, grid[0].length];\n  const queue: [number, number, number][] = [[...start, 0]];\n  const visited = new Set<string>([`${start[0]},${start[1]}`]);\n  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];\n  while (queue.length) {\n    const [r, c, dist] = queue.shift()!;\n    if (r === end[0] && c === end[1]) return dist;\n    for (const [dr, dc] of dirs) {\n      const [nr, nc] = [r+dr, c+dc];\n      const key = `${nr},${nc}`;\n      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key) && grid[nr][nc] === 0) {\n        visited.add(key); queue.push([nr, nc, dist+1]);\n      }\n    }\n  }\n  return -1;\n}', related: ['graph_algorithms', 'sliding_window'] },
  dfs: { id: 'dfs', label: 'DFS Applications', category: 'algoritmi', description: 'Path finding, cycle detection, strongly connected components, maze solving, island counting, tree traversal.', example: '// Number of Islands\nfunction numIslands(grid: string[][]): number {\n  let count = 0;\n  function dfs(r: number, c: number) {\n    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== "1") return;\n    grid[r][c] = "0"; // mark visited\n    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n  }\n  for (let r = 0; r < grid.length; r++)\n    for (let c = 0; c < grid[0].length; c++)\n      if (grid[r][c] === "1") { dfs(r, c); count++; }\n  return count;\n}', related: ['graph_algorithms', 'recursivitate'] },
  // Extra Design Patterns
  observer_advanced: { id: 'observer_advanced', label: 'Pub/Sub vs Observer', category: 'design-patterns', description: 'Observer: subject ține referință la observers. Pub/Sub: intermediar (message broker), subscribers nu știu de publishers. Decuplare mai mare în Pub/Sub.', example: '// Observer — direct coupling\nclass Button {\n  private listeners: Function[] = [];\n  onClick(fn: Function) { this.listeners.push(fn); }\n  click() { this.listeners.forEach(fn => fn()); }\n}\n\n// Pub/Sub — decoupled\nconst bus = new EventBus();\n// Publisher\nbus.publish("user:logged-in", { userId });\n// Subscriber (nu știe de publisher)\nbus.subscribe("user:logged-in", ({ userId }) => {\n  trackAnalytics("login", userId);\n});', related: ['observer', 'event_driven'] },
  adapter_pattern: { id: 'adapter_pattern', label: 'Adapter & Facade Pattern', category: 'design-patterns', description: 'Adapter: convertește interfața unui obiect la alta. Facade: interfață simplificată peste sistem complex.', example: '// Adapter — compatibilitate\ninterface ModernLogger { log(level: string, msg: string): void; }\n\nclass LegacyLogger {\n  info(msg: string) { console.log("[INFO]", msg); }\n  error(msg: string) { console.error("[ERROR]", msg); }\n}\n\nclass LoggerAdapter implements ModernLogger {\n  constructor(private legacy: LegacyLogger) {}\n  log(level: string, msg: string) {\n    if (level === "error") this.legacy.error(msg);\n    else this.legacy.info(msg);\n  }\n}\n\n// Facade\nclass AuthFacade {\n  // ascunde complexitatea: validate + hash + DB + session + email\n  async register(email: string, password: string) { /* simplified */ }\n}', related: ['design-patterns', 'dependency_injection'] },
  // Web Extra
  wasm: { id: 'wasm', label: 'WebAssembly (WASM)', category: 'web', description: 'Format binar care rulează în browser cu viteză aproape nativă. Compilat din C/C++/Rust. Emscripten sau wasm-pack pentru Rust.', example: '// Rust → WASM cu wasm-pack\n// Cargo.toml\n[lib]\ncrate-type = ["cdylib"]\n\n[dependencies]\nwasm-bindgen = "0.2"\n\n// lib.rs\nuse wasm_bindgen::prelude::*;\n\n#[wasm_bindgen]\npub fn fibonacci(n: u32) -> u32 {\n    if n <= 1 { return n; }\n    fibonacci(n-1) + fibonacci(n-2)\n}\n\n// JavaScript\nimport init, { fibonacci } from "./pkg/mylib";\nawait init();\nconsole.log(fibonacci(40)); // super rapid!', related: ['performance', 'web_workers'] },
  mutation_observer: { id: 'mutation_observer', label: 'MutationObserver & ResizeObserver', category: 'javascript', description: 'MutationObserver: observă schimbări în DOM (atribute, noduri). ResizeObserver: observă schimbări în dimensiunile elementului.', example: 'const mutationObs = new MutationObserver((mutations) => {\n  mutations.forEach(m => {\n    console.log("DOM changed:", m.type, m.target);\n  });\n});\nmutationObs.observe(document.body, { childList: true, subtree: true });\n\n// ResizeObserver\nconst resizeObs = new ResizeObserver((entries) => {\n  for (const entry of entries) {\n    const { width, height } = entry.contentRect;\n    console.log(`${entry.target.id}: ${width}x${height}`);\n  }\n});\nresizeObs.observe(document.getElementById("container")!);', related: ['intersection_observer', 'canvas_api'] },
  // Functional Extra
  monoid: { id: 'monoid', label: 'Pipe & Flow Utilities', category: 'functional', description: 'pipe/flow din librării (fp-ts, remeda, lodash/fp). Type-safe function composition. Remeda = alternative la lodash cu TS first.', example: 'import { pipe, flow } from "fp-ts/function";\nimport * as R from "remeda";\n\n// pipe — aplică funcții secvențial la o valoare\nconst result = pipe(\n  [1, 2, 3, 4, 5],\n  R.filter(n => n % 2 === 0),\n  R.map(n => n * 2),\n  R.reduce(0, (acc, n) => acc + n)\n); // 12\n\n// flow — creează funcție compusă\nconst processUsers = flow(\n  filterActive,\n  sortByName,\n  formatForDisplay\n);', related: ['composition', 'currying'] },
  lazy_evaluation: { id: 'lazy_evaluation', label: 'Lazy Evaluation', category: 'functional', description: 'Calculează valoarea doar când e nevoie. Generator-based lazy sequences. Economie de memorie și CPU pentru secvențe mari.', example: '// Lazy range\nfunction* range(start: number, end: number, step = 1) {\n  for (let i = start; i < end; i += step) yield i;\n}\n\n// Lazy filter/map (nu creează array intermediar)\nfunction* lazyFilter<T>(iter: Iterable<T>, pred: (x: T) => boolean) {\n  for (const x of iter) if (pred(x)) yield x;\n}\n\nfunction* lazyMap<T, U>(iter: Iterable<T>, fn: (x: T) => U) {\n  for (const x of iter) yield fn(x);\n}\n\n// Procesare eficientă a 1M+ elemente\nconst evens = lazyFilter(range(0, 1_000_000), n => n % 2 === 0);\nconst doubled = lazyMap(evens, n => n * 2);', related: ['iterators_generators', 'performance'] },
  // Testing Complete
  property_based: { id: 'property_based', label: 'Property-Based Testing', category: 'testing', description: 'Generează automat inputs și testează proprietăți. fast-check, hypothesis. Descoperă edge cases pe care nu le-ai gândit.', example: 'import * as fc from "fast-check";\n\n// Testează că sort e corect pentru orice array\ntest("sort is idempotent", () => {\n  fc.assert(fc.property(\n    fc.array(fc.integer()),\n    (arr) => {\n      const sorted = [...arr].sort((a,b) => a-b);\n      const doubleSorted = [...sorted].sort((a,b) => a-b);\n      return JSON.stringify(sorted) === JSON.stringify(doubleSorted);\n    }\n  ));\n});\n\n// Testează că add e comutativ\ntest("add is commutative", () => {\n  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => add(a,b) === add(b,a)));\n});', related: ['jest_testing', 'tdd'] },
  golden_path: { id: 'golden_path', label: 'Testing Strategies', category: 'testing', description: 'Testezi happy path (golden path), edge cases, error cases, boundary values. Test pyramid: mulți unit, câteva integration, puțini E2E.', example: '// Test Pyramid\n// E2E (10%): "user poate comanda un produs"\n// Integration (30%): "OrderService + DB creează comanda corect"\n// Unit (60%): "calculateTotal returnează suma corectă"\n\n// Edge cases de testat:\n// - String gol\n// - Null/undefined\n// - Număr negativ\n// - Array gol\n// - Integer maxim\n// - Caractere speciale\n// - Unicode\n// - Timestamp 0 (epoch)\n// - Timezone edges', related: ['tdd', 'e2e_testing'] },
  // Extra misc
  csrf_token: { id: 'csrf_token', label: 'API Key Management', category: 'securitate', description: 'Rotire periodică API keys. Rate limit per key. Scopes/permissions per key. Hash keys în DB (nu stoca în clar). Prefix pentru identificare.', example: 'function generateApiKey(): { key: string; hashedKey: string; prefix: string } {\n  const prefix = "jarvis_";\n  const raw = prefix + randomBytes(32).toString("base64url");\n  const hashedKey = createHash("sha256").update(raw).digest("hex");\n  return { key: raw, hashedKey, prefix };\n}\n\n// Stocare\nawait db.apiKeys.create({ hashedKey, userId, name, scopes: ["read", "write"] });\n\n// Verificare request\nconst raw = req.headers["x-api-key"];\nconst hashed = createHash("sha256").update(raw).digest("hex");\nconst key = await db.apiKeys.findByHash(hashed);\nif (!key || key.revokedAt) throw new Error("Invalid API key");', related: ['securitate', 'auth_jwt'] },
  sla_slo: { id: 'sla_slo', label: 'SLA, SLO & SLI', category: 'devops', description: 'SLI: Service Level Indicator (metrică). SLO: Service Level Objective (target). SLA: Service Level Agreement (contract cu penalități).', example: '// SLI — ce măsurăm\n// - Availability: requests reușite / total requests\n// - Latency: p99 < 500ms\n// - Error rate: errors / total requests\n\n// SLO — ce promitem intern\n// Availability SLO: 99.9% = max 8.7h downtime/an\n// Latency SLO: p99 < 500ms\n\n// SLA — ce promitem clienților (cu penalități)\n// 99.9% uptime SLA, altfel credit 10%\n\n// Error Budget = 1 - SLO\n// 99.9% SLO → 0.1% error budget = 43.8 min/lună', related: ['monitoring', 'devops'] },
  chaos_engineering: { id: 'chaos_engineering', label: 'Chaos Engineering', category: 'devops', description: 'Testează rezistența sistemului prin injectare de erori controlate. Netflix Chaos Monkey. Kill randome pods în K8s pentru a verifica resilience.', example: '// Chaos Monkey simplu\nasync function chaosMiddleware(req: Request, res: Response, next: NextFunction) {\n  if (process.env.CHAOS_ENABLED !== "true") return next();\n  \n  const rand = Math.random();\n  if (rand < 0.01) { // 1% din requesturi\n    await sleep(Math.random() * 2000); // delay 0-2s\n  }\n  if (rand < 0.001) { // 0.1% erori\n    return res.status(503).json({ error: "Chaos: Service unavailable" });\n  }\n  next();\n}', related: ['devops', 'monitoring'] },
  // Platform/Language Basics Extra
  typescript_strict: { id: 'typescript_strict', label: 'TypeScript Strict Mode', category: 'typescript', description: 'strict: true activează: strictNullChecks, noImplicitAny, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis.', example: '// Cu strict: true\nfunction greet(name: string | null) {\n  // name.toUpperCase(); // Error: poate fi null!\n  name?.toUpperCase(); // OK cu optional chaining\n  \n  if (name !== null) {\n    name.toUpperCase(); // OK — narrowed\n  }\n}\n\n// noImplicitAny\nfunction bad(x) { return x; } // Error: implicit any\nfunction good(x: string) { return x; } // OK\n\n// strictPropertyInitialization\nclass MyClass {\n  name: string; // Error — neinițializat!\n  name2: string = ""; // OK\n  name3!: string; // OK cu definite assignment assertion\n}', related: ['typescript_basics', 'typescript_config'] },
  ts_project_refs: { id: 'ts_project_refs', label: 'TypeScript Project References', category: 'typescript', description: 'Build incremental cu composite projects. Fiecare pachet e un tsconfig.json cu references la dependențe. Esențial pentru monorepo-uri mari.', example: '// tsconfig.json (root)\n{\n  "references": [\n    { "path": "./packages/utils" },\n    { "path": "./packages/ui" },\n    { "path": "./apps/web" }\n  ],\n  "files": []\n}\n\n// packages/utils/tsconfig.json\n{\n  "compilerOptions": { "composite": true, "declarationMap": true },\n  "include": ["src"]\n}\n\n// Build:\ntsc --build --verbose', related: ['typescript_config', 'monorepo'] },
  // Expo Extra
  expo_sqlite_advanced: { id: 'expo_sqlite_advanced', label: 'Expo SQLite Avansat', category: 'react-native', description: 'WAL mode, prepared statements, hooks (useSQLiteContext), live queries (addListener), transacții complexe.', example: 'import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";\n\n// Root: wrap app în provider\n<SQLiteProvider databaseName="jarvis.db" onInit={setupDB}>\n  <App />\n</SQLiteProvider>\n\n// Hook: acces la DB\nfunction useUsers() {\n  const db = useSQLiteContext();\n  const [users, setUsers] = useState([]);\n  useEffect(() => {\n    const stmt = db.prepareSync("SELECT * FROM users ORDER BY name");\n    const sub = stmt.executeSubscribeSync([], { onChange: () => {\n      setUsers(stmt.getAllSync());\n    }});\n    return () => { sub.unsubscribe(); stmt.finalizeSync(); };\n  }, []);\n  return users;\n}', related: ['sqlite', 'expo'] },
  rn_testing: { id: 'rn_testing', label: 'Testing React Native', category: 'react-native', description: 'Jest + @testing-library/react-native pentru unit/component tests. Maestro sau Detox pentru E2E. Mock-uite native modules.', example: 'import { render, fireEvent, waitFor } from "@testing-library/react-native";\n\ndescribe("LoginScreen", () => {\n  it("shows error for invalid email", async () => {\n    const { getByPlaceholderText, getByText } = render(<LoginScreen />);\n    fireEvent.changeText(getByPlaceholderText("Email"), "invalid");\n    fireEvent.press(getByText("Conectare"));\n    await waitFor(() => {\n      expect(getByText("Email invalid")).toBeTruthy();\n    });\n  });\n});\n\n// Mock native module\njest.mock("expo-secure-store", () => ({\n  getItemAsync: jest.fn().mockResolvedValue("token"),\n  setItemAsync: jest.fn(),\n}));', related: ['jest_testing', 'react_native'] },

  // ── Batch 4: 120+ concepte pentru a atinge 500+ ──
  class_fields: { id: 'class_fields', label: 'Class Fields & Private Methods', category: 'javascript', description: 'Public class fields, private (#) fields native, static fields/methods. Fără nevoie de constructor pentru inițializare simplă.', example: 'class Counter {\n  #count = 0; // private nativ\n  static instances = 0;\n  \n  constructor() { Counter.instances++; }\n  \n  increment() { this.#count++; }\n  get value() { return this.#count; }\n  \n  #reset() { this.#count = 0; } // private method\n  \n  static create() { return new Counter(); }\n}', related: ['clasa', 'encapsulation'] },
  pipeline_operator: { id: 'pipeline_operator', label: 'Pipeline Operator (|>)', category: 'javascript', description: 'Propunere TC39 pentru pipe operator. x |> f = f(x). Alternativă: funcții pipe/flow din librării. Îmbunătățește lizibilitate cod funcțional.', example: '// Propunere (nc standard)\nconst result = value\n  |> double\n  |> addOne\n  |> square;\n\n// Echivalent cu pipe\nconst result2 = pipe(value, double, addOne, square);\n\n// sau\nconst result3 = square(addOne(double(value)));', related: ['composition', 'currying'] },
  structural_subtyping: { id: 'structural_subtyping', label: 'Structural Typing (Duck Typing)', category: 'typescript', description: 'TypeScript folosește structural typing: dacă un tip are proprietățile necesare, e compatibil. Nu contează declarația, contează forma.', example: 'interface Printable { toString(): string; }\n\nfunction print(obj: Printable) {\n  console.log(obj.toString());\n}\n\n// Orice obiect cu toString() e Printable\nprint({ toString: () => "hello" }); // OK fără to declare\nprint(42); // OK — number are toString()\nprint(new Date()); // OK — Date are toString()', related: ['interfata', 'typescript_basics'] },
  symbol_iterator: { id: 'symbol_iterator', label: 'Custom Iterables', category: 'javascript', description: 'Implementează Symbol.iterator pentru a face obiectele iterabile în for...of, spread, destructuring.', example: 'class NumberRange {\n  constructor(private start: number, private end: number) {}\n  \n  [Symbol.iterator]() {\n    let current = this.start;\n    const end = this.end;\n    return {\n      next() {\n        return current <= end\n          ? { value: current++, done: false }\n          : { value: undefined, done: true };\n      }\n    };\n  }\n}\n\nfor (const n of new NumberRange(1, 5)) console.log(n);\nconst nums = [...new NumberRange(1, 5)]; // [1,2,3,4,5]', related: ['iterators_generators', 'symbol_type'] },
  async_generator: { id: 'async_generator', label: 'Async Generators', category: 'javascript', description: 'Combina generators cu async/await. async function* pentru secvențe async. for await...of pentru consum.', example: 'async function* fetchPages(url: string) {\n  let page = 1;\n  let hasMore = true;\n  while (hasMore) {\n    const res = await fetch(`${url}?page=${page}`);\n    const { data, hasNextPage } = await res.json();\n    yield* data;\n    hasMore = hasNextPage;\n    page++;\n  }\n}\n\n// Consum\nfor await (const item of fetchPages("/api/users")) {\n  processItem(item);\n}', related: ['iterators_generators', 'async_await'] },
  error_cause: { id: 'error_cause', label: 'Error.cause & Error Chaining', category: 'javascript', description: 'Error.cause (ES2022): propagă eroarea originală în cauza erorii noi. Util pentru error chains fără a pierde stack trace-ul original.', example: 'async function getUser(id: string) {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    if (!res.ok) throw new Error("HTTP error");\n    return await res.json();\n  } catch (original) {\n    throw new Error(`Failed to get user ${id}`, { cause: original });\n  }\n}\n\ntry { await getUser("123"); }\ncatch (e) {\n  console.error(e.message); // "Failed to get user 123"\n  console.error(e.cause.message); // "HTTP error"\n}', related: ['error_handling', 'error_types'] },
  array_grouping: { id: 'array_grouping', label: 'Array Grouping (Object.groupBy)', category: 'javascript', description: 'Object.groupBy (ES2024): grupează array după un criteriu. Map.groupBy pentru chei de orice tip. Înlocuiește reduce-urile complexe.', example: 'const inventory = [\n  { name: "asparagus", type: "vegetables", quantity: 5 },\n  { name: "bananas", type: "fruit", quantity: 0 },\n  { name: "goat", type: "meat", quantity: 23 },\n  { name: "cherries", type: "fruit", quantity: 5 },\n];\n\nconst byType = Object.groupBy(inventory, item => item.type);\n// { vegetables: [...], fruit: [...], meat: [...] }\n\n// Cu reduce (înainte de ES2024)\nconst grouped = inventory.reduce((acc, item) => {\n  (acc[item.type] ??= []).push(item);\n  return acc;\n}, {} as Record<string, typeof inventory>);', related: ['array_methods', 'map_filter_reduce'] },
  at_method: { id: 'at_method', label: 'Array/String .at() Method', category: 'javascript', description: '.at() acceptă index negativ (de la coadă). arr.at(-1) = ultimul element. Mai clar decât arr[arr.length-1].', example: 'const arr = [1, 2, 3, 4, 5];\narr.at(0);  // 1 (primul)\narr.at(-1); // 5 (ultimul)\narr.at(-2); // 4 (penultimul)\n\n"hello".at(-1); // "o"\n\n// Vs vechea metodă\narr[arr.length - 1]; // greu de citit\narr.at(-1); // clar!', related: ['array_methods', 'string_methods'] },
  logical_nullish: { id: 'logical_nullish', label: 'Object.hasOwn & Array.from', category: 'javascript', description: 'Object.hasOwn (ES2022): înlocuiește Object.hasOwnProperty.call. Array.from cu mapping. Array.of pentru creare.', example: 'const obj = { a: 1, b: 2 };\nObject.hasOwn(obj, "a"); // true (mai safe decât hasOwnProperty)\n\n// Array.from cu transform\nArray.from("abc"); // ["a","b","c"]\nArray.from({length: 5}, (_, i) => i + 1); // [1,2,3,4,5]\nArray.from(new Set([1,2,2,3])); // [1,2,3]\nArray.from(map.values()); // values din Map\n\n// Array.of\nArray.of(7); // [7] (vs new Array(7) = [,,,,,,]!)', related: ['array_methods', 'map_type'] },
  temporal_api: { id: 'temporal_api', label: 'Temporal API (Date modern)', category: 'javascript', description: 'Proposal TC39 pentru înlocuirea Date. Immutable, timezone-aware, explicit. Polyfill disponibil @js-temporal/polyfill.', example: 'import { Temporal } from "@js-temporal/polyfill";\n\nconst now = Temporal.Now.plainDateTimeISO();\nconst tomorrow = now.add({ days: 1 });\nconst diff = now.until(tomorrow); // Duration\n\n// Timezone-aware\nconst bucharest = Temporal.Now.zonedDateTimeISO("Europe/Bucharest");\n\n// Formatare\nnow.toString(); // "2024-03-15T10:30:00"\nnow.toPlainDate().toString(); // "2024-03-15"', related: ['date_js', 'i18n'] },
  // React Native Specific
  metro_bundler: { id: 'metro_bundler', label: 'Metro Bundler (RN)', category: 'react-native', description: 'Bundler-ul React Native. Fast refresh, module resolution, transformer. metro.config.js pentru customizare. Cache la ~/.metro sau node_modules/.cache.', example: '// metro.config.js\nconst { getDefaultConfig } = require("expo/metro-config");\nconst { withNativeWind } = require("nativewind/metro");\n\nconst config = getDefaultConfig(__dirname);\n\n// SVG support\nconfig.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");\nconfig.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");\nconfig.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];\n\nmodule.exports = withNativeWind(config, { input: "./global.css" });', related: ['expo', 'vite'] },
  jsx_transform: { id: 'jsx_transform', label: 'JSX Transform & Pragma', category: 'react', description: 'JSX e compilat în React.createElement (vechi) sau import automat (nou, React 17+). TSX, Babel, SWC transformă JSX la JS.', example: '// JSX\nconst el = <Button color="blue">Click</Button>;\n\n// Transformat în (React 17+)\nconst el = _jsx(Button, { color: "blue", children: "Click" });\n\n// Custom JSX pragma (e.g., Preact)\n/** @jsxImportSource preact */\n\n// Fragment\nconst list = <><li>A</li><li>B</li></>;\n// devine\nconst list = _jsxs(Fragment, { children: [_jsx("li", {children:"A"}), _jsx("li", {children:"B"})] });', related: ['react', 'vite'] },
  reconciler: { id: 'reconciler', label: 'Virtual DOM & Reconciliation', category: 'react', description: 'Virtual DOM: reprezentare JS a UI. Reconciliation: comparare VDOM arbori (diffing). Fiber: algoritm incremental React 16+. O(n) cu euristici.', example: '// Euristici React reconciliation:\n// 1. Elemente de tip diferit → rebuild complet\n// 2. Același tip → update props\n// 3. Keys: identifcă elementele în liste\n\n// Fiber — poate pausa, reordona, reuse work\n// Concurrent Mode: prioritizes urgent updates\n// - User input = high priority\n// - Background data fetch = low priority\n\n// Render phase: calcul (poate fi întrerupt)\n// Commit phase: aplicare DOM (sincron, nu poate fi întrerupt)', related: ['react', 'use_transition'] },
  context_api: { id: 'context_api', label: 'Context API vs Props Drilling', category: 'react', description: 'Props drilling: pasarea props prin mai multe niveluri intermediare. Context evită asta dar nu e panaceu. Prefer props pentru 1-2 niveluri.', example: '// Props drilling — problematic la 4+ niveluri\n// App → Layout → Sidebar → UserMenu → Avatar → UserName\n// Fiecare componentă intermediară trebuie să primească user prop\n\n// Cu Context\nconst UserContext = createContext<User | null>(null);\n\n// La nivel top\n<UserContext.Provider value={currentUser}>\n  <App />\n</UserContext.Provider>\n\n// La Avatar (orice nivel adâncime)\nconst user = useContext(UserContext);', related: ['context', 'render_optimization'] },
  use_layout_effect: { id: 'use_layout_effect', label: 'useLayoutEffect vs useEffect', category: 'react', description: 'useLayoutEffect: sincron, după DOM mutations, înainte de paint. useEffect: async, după paint. useLayoutEffect pentru măsurări DOM, tooltip positioning.', example: '// useLayoutEffect — sincron, blochează paint\nfunction Tooltip() {\n  const [pos, setPos] = useState({ top: 0, left: 0 });\n  const ref = useRef<View>(null);\n  \n  useLayoutEffect(() => {\n    ref.current?.measure((x, y, w, h, pageX, pageY) => {\n      setPos({ top: pageY + h, left: pageX }); // măsurare înainte de paint\n    });\n  });\n  \n  return <Animated.View style={{ position: "absolute", ...pos }} />;\n}', related: ['useeffect', 'forward_ref'] },
  // Architecture Patterns
  command_pattern: { id: 'command_pattern', label: 'Command Pattern', category: 'design-patterns', description: 'Încapsulează acțiunile ca obiecte. Undo/redo, queue, logging. Receiver + Command + Invoker + Client.', example: 'interface Command {\n  execute(): void;\n  undo(): void;\n}\n\nclass TextEditor {\n  private history: Command[] = [];\n  \n  execute(cmd: Command) {\n    cmd.execute();\n    this.history.push(cmd);\n  }\n  \n  undo() {\n    this.history.pop()?.undo();\n  }\n}\n\nclass InsertText implements Command {\n  constructor(private doc: Document, private text: string, private pos: number) {}\n  execute() { this.doc.insert(this.text, this.pos); }\n  undo() { this.doc.delete(this.pos, this.text.length); }\n}', related: ['design-patterns', 'clasa'] },
  iterator_pattern: { id: 'iterator_pattern', label: 'Iterator Pattern', category: 'design-patterns', description: 'Accesează elementele unei colecții secvențial fără a cunoaște implementarea. JavaScript Iterator Protocol: { next() { return { value, done } } }.', example: 'class InfiniteCounter implements Iterable<number> {\n  constructor(private start = 0, private step = 1) {}\n  \n  [Symbol.iterator](): Iterator<number> {\n    let current = this.start;\n    const step = this.step;\n    return {\n      next(): IteratorResult<number> {\n        return { value: current, done: false };\n        current += step;\n      }\n    };\n  }\n}\n\nconst counter = new InfiniteCounter(0, 2);\nconst [first, second, third] = counter; // 0, 2, 4', related: ['iterators_generators', 'symbol_iterator'] },
  mediator_pattern: { id: 'mediator_pattern', label: 'Mediator Pattern', category: 'design-patterns', description: 'Centralizează comunicarea între obiecte. Reduce coupling. Exemplu: event bus, chat room, air traffic control.', example: 'interface Colleague {\n  receive(msg: string, from: string): void;\n  send(msg: string): void;\n}\n\nclass ChatRoom {\n  private colleagues: Map<string, Colleague> = new Map();\n  \n  register(name: string, colleague: Colleague) {\n    this.colleagues.set(name, colleague);\n  }\n  \n  broadcast(msg: string, from: string) {\n    this.colleagues.forEach((c, name) => {\n      if (name !== from) c.receive(msg, from);\n    });\n  }\n}', related: ['observer', 'design-patterns'] },
  template_method: { id: 'template_method', label: 'Template Method Pattern', category: 'design-patterns', description: 'Definește scheletul unui algoritm în clasa de bază. Subclasele implementează pașii specifici. Inversează controlul — baza apelează subclasa.', example: 'abstract class DataMigration {\n  // Template method — nu poate fi override\n  async run() {\n    await this.connect();\n    const data = await this.extract();\n    const transformed = this.transform(data);\n    await this.load(transformed);\n    await this.disconnect();\n    this.onComplete();\n  }\n  \n  protected abstract extract(): Promise<any[]>;\n  protected abstract transform(data: any[]): any[];\n  protected abstract load(data: any[]): Promise<void>;\n  protected onComplete() { console.log("Migration done!"); } // hook\n}', related: ['inheritance', 'design-patterns'] },
  chain_of_responsibility: { id: 'chain_of_responsibility', label: 'Chain of Responsibility', category: 'design-patterns', description: 'Pasează request-ul prin lanț de handlers. Fiecare handler decidie să proceseze sau să pase mai departe. Express middleware = implementare clasică.', example: '// Express middleware chain\napp.use(requestLogger);\napp.use(authenticate);\napp.use(authorize("admin"));\napp.use(validate(schema));\napp.post("/api/resource", createResource);\n\n// Pattern:\nfunction middleware(req: Request, res: Response, next: NextFunction) {\n  if (someCondition) {\n    doWork();\n    next(); // pasează la next handler\n  } else {\n    res.status(401).send("Unauthorized"); // oprește lanțul\n  }\n}', related: ['middleware', 'design-patterns'] },
  // SQL Complete
  sql_joins: { id: 'sql_joins', label: 'SQL Joins', category: 'database', description: 'INNER JOIN: rânduri comune. LEFT JOIN: toate din stânga + matching din dreapta. RIGHT JOIN: invers. FULL OUTER JOIN: toate. CROSS JOIN: produsul cartezian.', example: '-- INNER JOIN\nSELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON o.user_id = u.id;\n\n-- LEFT JOIN — toți userii, chiar fără comenzi\nSELECT u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name;\n\n-- SELF JOIN — manageri\nSELECT e.name as employee, m.name as manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id;', related: ['sql', 'query_optimization'] },
  sql_window: { id: 'sql_window', label: 'SQL Window Functions', category: 'database', description: 'Calcule pe seturi de rânduri fără GROUP BY. ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM OVER, AVG OVER, PARTITION BY.', example: 'SELECT\n  name,\n  salary,\n  department,\n  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank_in_dept,\n  salary - LAG(salary) OVER (ORDER BY hire_date) as salary_change,\n  SUM(salary) OVER (PARTITION BY department) as dept_total,\n  salary / SUM(salary) OVER (PARTITION BY department) * 100 as pct_of_dept\nFROM employees;', related: ['sql', 'postgresql'] },
  sql_cte: { id: 'sql_cte', label: 'CTE & Recursive Queries', category: 'database', description: 'CTE (WITH): query-uri mai lizibile, reutilizabile. Recursive CTE: ierarhii (organizații, categorii, BFS/DFS în SQL).', example: '-- CTE\nWITH active_customers AS (\n  SELECT * FROM customers WHERE is_active = true\n),\ntop_spenders AS (\n  SELECT customer_id, SUM(total) as spent\n  FROM orders\n  GROUP BY customer_id\n  HAVING SUM(total) > 1000\n)\nSELECT c.name, ts.spent\nFROM active_customers c\nJOIN top_spenders ts ON ts.customer_id = c.id;\n\n-- Recursive — ierarhie categorii\nWITH RECURSIVE category_tree AS (\n  SELECT id, name, parent_id, 0 as depth FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, c.name, c.parent_id, ct.depth + 1\n  FROM categories c JOIN category_tree ct ON ct.id = c.parent_id\n)\nSELECT * FROM category_tree;', related: ['sql', 'postgresql'] },
  sql_views: { id: 'sql_views', label: 'Views & Materialized Views', category: 'database', description: 'View: query salvat ca tabel virtual. Materialized view: date precalculate stocate fizic, refresh periodic. Util pentru rapoarte, abstractizare.', example: "-- View simplu\nCREATE VIEW user_order_summary AS\nSELECT u.id, u.name, u.email, COUNT(o.id) as orders, SUM(o.total) as total_spent\nFROM users u LEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name, u.email;\n\nSELECT * FROM user_order_summary WHERE total_spent > 1000;\n\n-- Materialized view (PostgreSQL)\nCREATE MATERIALIZED VIEW monthly_stats AS\nSELECT DATE_TRUNC('month', created_at) as month, COUNT(*), SUM(total)\nFROM orders GROUP BY 1;\n\n-- Refresh\nREFRESH MATERIALIZED VIEW CONCURRENTLY monthly_stats;", related: ['sql', 'query_optimization'] },
  // Security
  encoding_escaping: { id: 'encoding_escaping', label: 'Encoding & Escaping', category: 'securitate', description: 'HTML escaping pentru XSS. URL encoding pentru query params. Base64 pentru date binare în text. Unicode normalizare pentru path traversal.', example: '// HTML escaping\nfunction escapeHtml(str: string): string {\n  return str\n    .replace(/&/g, "&amp;")\n    .replace(/</g, "&lt;")\n    .replace(/>/g, "&gt;")\n    .replace(/"/g, "&quot;")\n    .replace(/\'/g, "&#039;");\n}\n\n// URL encoding\nencodeURIComponent("hello world!"); // "hello%20world!"\nencodeURI("https://example.com/path?q=hello world"); // encodes space\n\n// Base64\nbtoa("binary data"); // encode\natob("YmluYXJ5IGRhdGE="); // decode', related: ['xss_prevention', 'owasp'] },
  secure_random: { id: 'secure_random', label: 'Secure Random & Token Generation', category: 'securitate', description: 'Math.random() e predictibil — NICIODATĂ pentru securitate! Folosește crypto.getRandomValues (browser) sau randomBytes (Node.js).', example: '// Browser\nconst array = new Uint8Array(32);\ncrypto.getRandomValues(array); // secure!\nconst token = Array.from(array, b => b.toString(16).padStart(2,"0")).join("");\n\n// Node.js\nimport { randomBytes, randomUUID } from "crypto";\nconst token = randomBytes(32).toString("hex"); // 64 hex chars\nconst id = randomUUID(); // UUID v4\n\n// Session token\nconst sessionToken = randomBytes(48).toString("base64url"); // URL-safe', related: ['crypto_module', 'owasp'] },
  // Performance
  lazy_import: { id: 'lazy_import', label: 'Dynamic Import & Lazy Loading', category: 'performance', description: 'import() returnează Promise. Code splitting automat cu Vite/webpack. React.lazy pentru componente. Preload pentru anticipare.', example: '// Dynamic import\nconst module = await import("./heavy-module");\nmodule.doSomething();\n\n// React.lazy\nconst HeavyChart = lazy(() => import("./HeavyChart"));\n<Suspense fallback={<Skeleton />}><HeavyChart /></Suspense>\n\n// Preload — anticipează navigarea\nfunction App() {\n  const [prefetched, setPrefetched] = useState(false);\n  \n  const prefetch = () => {\n    if (!prefetched) {\n      import("./SomePage"); // trigger loading\n      setPrefetched(true);\n    }\n  };\n  \n  return <Link onMouseEnter={prefetch} href="/page">Page</Link>;\n}', related: ['code_splitting', 'suspense_react'] },
  memoization_advanced: { id: 'memoization_advanced', label: 'Memoization Patterns', category: 'performance', description: 'Cache rezultate funcții pure. WeakMap pentru obiecte (GC-friendly). LRU cache pentru memorie limitată. reselect pentru Redux selectors.', example: 'function memoize<T extends (...args: any[]) => any>(fn: T): T {\n  const cache = new Map<string, ReturnType<T>>();\n  return ((...args: Parameters<T>) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  }) as T;\n}\n\n// LRU Cache\nclass LRUCache<K, V> {\n  private cache = new Map<K, V>();\n  constructor(private capacity: number) {}\n  \n  get(key: K): V | undefined {\n    if (!this.cache.has(key)) return undefined;\n    const val = this.cache.get(key)!;\n    this.cache.delete(key);\n    this.cache.set(key, val); // move to end (most recent)\n    return val;\n  }\n  \n  put(key: K, val: V): void {\n    if (this.cache.has(key)) this.cache.delete(key);\n    else if (this.cache.size >= this.capacity) this.cache.delete(this.cache.keys().next().value);\n    this.cache.set(key, val);\n  }\n}', related: ['memoizare', 'hash_table'] },
  // Node.js Extra
  process_management: { id: 'process_management', label: 'Process & Signal Handling', category: 'backend', description: 'process.env, process.exit, process.pid. Signal handlers: SIGTERM (graceful), SIGINT (ctrl+c), SIGUSR2 (pm2 reload). Uncaught exception handling.', example: 'process.on("uncaughtException", (err) => {\n  console.error("Uncaught Exception:", err);\n  process.exit(1); // EXIT! Nu poți recupera\n});\n\nprocess.on("unhandledRejection", (reason, promise) => {\n  console.error("Unhandled Rejection:", reason);\n  // Node 15+: crashing automat\n});\n\nprocess.on("SIGTERM", () => gracefulShutdown());\nprocess.on("SIGINT", () => gracefulShutdown());\n\nconsole.log("PID:", process.pid);\nconsole.log("Memory:", process.memoryUsage().heapUsed / 1024 / 1024, "MB");', related: ['nodejs', 'graceful_shutdown'] },
  buffer_node: { id: 'buffer_node', label: 'Buffers & Binary Data', category: 'backend', description: 'Buffer: date binare în Node.js. Encodings: utf8, hex, base64, binary. Util pentru criptografie, streams, protocoale binare.', example: 'const buf = Buffer.from("Hello, World!", "utf8");\nbuf.toString("hex"); // "48656c6c6f2c..."\nbuf.toString("base64"); // "SGVsbG8sIFdvcmxkIQ=="\n\nconst buf2 = Buffer.alloc(16); // zero-filled\ncrypto.randomFillSync(buf2); // fill with random bytes\n\n// Concat buffers\nconst combined = Buffer.concat([buf1, buf2]);\n\n// Slice (zero-copy!)\nconst slice = buf.subarray(0, 5);', related: ['streaming', 'crypto_module'] },
  // Expo
  expo_config_plugins: { id: 'expo_config_plugins', label: 'Expo Config Plugins', category: 'react-native', description: 'Modifică native code (Android Manifest, Info.plist) fără a ejecta. withAndroidManifest, withXcodeProject, createRunOncePlugin.', example: '// app.config.js — config plugin custom\nconst withCustomAndroid = (config) => {\n  const { withAndroidManifest } = require("@expo/config-plugins");\n  return withAndroidManifest(config, async (config) => {\n    const manifest = config.modResults;\n    const application = manifest.manifest.application[0];\n    application.$["android:usesCleartextTraffic"] = "true"; // dev only\n    return config;\n  });\n};\n\nmodule.exports = { expo: { plugins: [withCustomAndroid] } };', related: ['expo', 'eas_build'] },
  expo_dev_client: { id: 'expo_dev_client', label: 'Expo Dev Client', category: 'react-native', description: 'Development client cu native modules custom. Alternativă la Expo Go pentru librării native non-standard. EAS Build --profile development.', example: '// eas.json\n{\n  "build": {\n    "development": {\n      "developmentClient": true,\n      "distribution": "internal",\n      "android": { "buildType": "apk" }\n    }\n  }\n}\n\n// Pornire\nnpx expo start --dev-client\n\n// sau cu tunnel\nnpx expo start --dev-client --tunnel\n\n// Fast refresh funcționează ca și Expo Go\n// dar cu toate native modules', related: ['expo', 'eas_build'] },
  // Web
  web_components: { id: 'web_components', label: 'Web Components', category: 'web', description: 'Custom HTML elements. Shadow DOM pentru izolare CSS. HTML templates. Interoperabile cu orice framework.', example: 'class MyButton extends HTMLElement {\n  static observedAttributes = ["label", "disabled"];\n  \n  constructor() {\n    super();\n    const shadow = this.attachShadow({ mode: "open" });\n    shadow.innerHTML = `\n      <style>button { background: var(--primary, #6C63FF); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }</style>\n      <button><slot></slot></button>\n    `;\n  }\n  \n  attributeChangedCallback(name: string, _: string, val: string) {\n    if (name === "disabled") this.shadowRoot!.querySelector("button")!.disabled = val !== null;\n  }\n}\n\ncustomElements.define("my-button", MyButton);\n// <my-button label="Click">Apasă</my-button>', related: ['pwa', 'spa_architecture'] },
  cookie_management: { id: 'cookie_management', label: 'Cookie Management', category: 'securitate', description: 'Atribute cookie: HttpOnly (nu JS), Secure (HTTPS only), SameSite (CSRF protection), Domain, Path, Expires/Max-Age, Priority.', example: '// Set cookie server-side\nres.cookie("session", token, {\n  httpOnly: true,      // nu accesibil din JS\n  secure: true,        // HTTPS only\n  sameSite: "strict",  // CSRF protection\n  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 zile\n  path: "/",\n});\n\n// Clear cookie\nres.clearCookie("session", { path: "/" });\n\n// Cookie SameSite:\n// "strict" — nu trimis pe cross-site navigare\n// "lax" — trimis pe navigare normală\n// "none" — trimis mereu (necesită Secure)', related: ['session_management', 'csrf_prevention'] },
  // Algorithms
  memoize_dp: { id: 'memoize_dp', label: 'Memoized Recursion (Top-Down DP)', category: 'algoritmi', description: 'Adaugă cache la recursivitate pentru a evita recalcularea subproblemelor. Mult mai simplu de scris decât bottom-up dar stack overflow posibil.', example: 'function memoDP<T>(fn: Function): Function {\n  const memo = new Map<string, T>();\n  function helper(...args: any[]): T {\n    const key = JSON.stringify(args);\n    if (memo.has(key)) return memo.get(key)!;\n    const result = fn(...args, helper);\n    memo.set(key, result);\n    return result;\n  }\n  return helper;\n}\n\n// Fibonacci memoized\nconst fib = memoDP((n: number, helper: Function) => {\n  if (n <= 1) return n;\n  return helper(n-1) + helper(n-2);\n});\nfib(100); // instant', related: ['dynamic_programming', 'recursivitate'] },
  matrix_operations: { id: 'matrix_operations', label: 'Matrix Operations', category: 'algoritmi', description: 'Spiral traversal, rotate 90°, transpose, search in sorted matrix, flood fill. Pattern comun în coding interviews.', example: '// Rotate matrix 90° clockwise\nfunction rotate(matrix: number[][]): void {\n  const n = matrix.length;\n  // Transpose\n  for (let i = 0; i < n; i++)\n    for (let j = i + 1; j < n; j++)\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n  // Reverse each row\n  for (let i = 0; i < n; i++)\n    matrix[i].reverse();\n}\n\n// Spiral order\nfunction spiralOrder(matrix: number[][]): number[] {\n  const res: number[] = [];\n  let [top, bottom, left, right] = [0, matrix.length-1, 0, matrix[0].length-1];\n  while (top <= bottom && left <= right) {\n    for (let i = left; i <= right; i++) res.push(matrix[top][i]);\n    top++;\n    // ... etc\n  }\n  return res;\n}', related: ['graph_algorithms', 'dynamic_programming'] },
  // CSS Extra
  css_variables: { id: 'css_variables', label: 'CSS Custom Properties (Variables)', category: 'styling', description: 'Variabile CSS native. Cascadare și moștenire. Teme dinamice cu JS. Fallback values. Calc() cu variabile.', example: ':root {\n  --color-primary: #6C63FF;\n  --color-bg: #0A0A0F;\n  --spacing-sm: 8px;\n  --border-radius: 12px;\n}\n\n[data-theme="light"] {\n  --color-bg: #FFFFFF;\n  --color-text: #0A0A0F;\n}\n\n.card {\n  background: var(--color-bg);\n  border-radius: var(--border-radius);\n  padding: calc(var(--spacing-sm) * 2);\n}\n\n// Dynamic cu JS\ndocument.documentElement.style.setProperty("--color-primary", userColor);', related: ['tailwind', 'dark_mode'] },
  css_pseudo: { id: 'css_pseudo', label: 'CSS Pseudo-classes & Pseudo-elements', category: 'styling', description: ':hover, :focus, :active, :disabled, :checked, :nth-child(). ::before, ::after, ::placeholder, ::selection. :not(), :is(), :where().', example: '/* Pseudo-classes */\na:hover { color: var(--primary); }\ninput:focus { outline: 2px solid var(--primary); }\nbutton:disabled { opacity: 0.5; cursor: not-allowed; }\nli:nth-child(odd) { background: #f5f5f5; }\n\n/* :is() — grouping selectors */\n:is(h1, h2, h3):hover { color: var(--primary); }\n\n/* ::before / ::after */\n.required::after {\n  content: " *";\n  color: red;\n}\n\n/* ::selection */\n::selection { background: var(--primary); color: white; }', related: ['css_animations', 'css_variables'] },
  css_clamp: { id: 'css_clamp', label: 'CSS clamp() & Fluid Typography', category: 'styling', description: 'clamp(min, preferred, max) pentru fluid values. Font size care se scalează între breakpoints fără media queries.', example: ':root {\n  /* Font care merge de la 16px pe mobile la 24px pe desktop */\n  --fs-lg: clamp(1rem, 2.5vw, 1.5rem);\n  \n  /* Spacing fluid */\n  --space-md: clamp(1rem, 3vw, 2rem);\n}\n\nh1 { font-size: clamp(1.75rem, 5vw, 3.5rem); }\n\n/* Fluid grid — coloane care se ajustează */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 30%, 400px), 1fr));\n}', related: ['media_queries', 'css_grid'] },
  // Mobile
  rn_maps: { id: 'rn_maps', label: 'Maps în React Native', category: 'react-native', description: 'react-native-maps: MapView, Marker, Polyline, Polygon, Callout. Clustering cu RNMC. Custom styles. Tile providers.', example: 'import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";\n\n<MapView\n  provider={PROVIDER_GOOGLE}\n  style={{ flex: 1 }}\n  initialRegion={{\n    latitude: 44.4268,\n    longitude: 26.1025,\n    latitudeDelta: 0.0922,\n    longitudeDelta: 0.0421,\n  }}\n  customMapStyle={darkMapStyle}\n  showsUserLocation\n  followsUserLocation\n>\n  <Marker\n    coordinate={{ latitude: 44.4268, longitude: 26.1025 }}\n    title="București"\n    description="Capitala României"\n  />\n</MapView>', related: ['expo_location', 'react_native'] },
  rn_audio: { id: 'rn_audio', label: 'Audio în React Native', category: 'react-native', description: 'expo-av: Audio.Sound pentru playback. expo-audio (nou). Recording, streaming. react-native-track-player pentru media player complet.', example: 'import { Audio } from "expo-av";\n\nasync function playAudio(uri: string) {\n  await Audio.setAudioModeAsync({\n    playsInSilentModeIOS: true,\n    staysActiveInBackground: true,\n  });\n  \n  const { sound } = await Audio.Sound.createAsync(\n    { uri },\n    { shouldPlay: true, volume: 1.0 }\n  );\n  \n  sound.setOnPlaybackStatusUpdate(status => {\n    if (status.isLoaded && status.didJustFinish) {\n      sound.unloadAsync();\n    }\n  });\n  return sound;\n}', related: ['expo', 'permissions'] },
  rn_blur: { id: 'rn_blur', label: 'BlurView & Visual Effects RN', category: 'react-native', description: 'expo-blur: BlurView pentru glass morphism. MaskedView pentru clip paths. LinearGradient pentru gradient backgrounds.', example: 'import { BlurView } from "expo-blur";\nimport { LinearGradient } from "expo-linear-gradient";\n\n// Glass morphism card\n<BlurView intensity={80} tint="dark" style={styles.card}>\n  <Text style={styles.title}>Glass Card</Text>\n</BlurView>\n\n// Gradient background\n<LinearGradient\n  colors={["#6C63FF", "#00D4FF"]}\n  start={{ x: 0, y: 0 }}\n  end={{ x: 1, y: 1 }}\n  style={styles.gradient}\n>\n  <Text>Gradient Button</Text>\n</LinearGradient>', related: ['stylesheet_rn', 'react_native'] },
  // Network
  sse: { id: 'sse', label: 'Server-Sent Events (SSE)', category: 'backend', description: 'Streaming unidirecțional server → client. Mult mai simplu decât WebSocket pentru push notifications, live updates. Reconectare automată în browser.', example: '// Server (Express)\napp.get("/events", (req, res) => {\n  res.setHeader("Content-Type", "text/event-stream");\n  res.setHeader("Cache-Control", "no-cache");\n  res.setHeader("Connection", "keep-alive");\n  \n  const send = (event: string, data: unknown) => {\n    res.write(`event: ${event}\\ndata: ${JSON.stringify(data)}\\n\\n`);\n  };\n  \n  const interval = setInterval(() => send("update", { time: Date.now() }), 1000);\n  req.on("close", () => clearInterval(interval));\n});\n\n// Client\nconst es = new EventSource("/events");\nes.addEventListener("update", e => console.log(JSON.parse(e.data)));', related: ['websocket', 'streaming'] },
  long_polling: { id: 'long_polling', label: 'Long Polling & Comet', category: 'backend', description: 'Long polling: client ține conexiunea deschisă. Server răspunde când are date. Fallback pentru WebSocket. Mai simplu dar mai puțin eficient.', example: '// Server\napp.get("/poll", async (req, res) => {\n  const start = Date.now();\n  const maxWait = 30000; // 30s timeout\n  \n  while (Date.now() - start < maxWait) {\n    const data = await checkForNewData(req.query.lastId);\n    if (data) return res.json(data);\n    await sleep(1000); // wait 1s\n  }\n  res.json({ timeout: true });\n});\n\n// Client — recursiv long poll\nasync function poll(lastId: string) {\n  const data = await fetch(`/poll?lastId=${lastId}`);\n  process(data);\n  poll(data.id); // poll iar\n}', related: ['websocket', 'fetch_api'] },
  // Data Structures
  stack_queue: { id: 'stack_queue', label: 'Stack & Queue Implementations', category: 'algoritmi', description: 'Stack: LIFO (Last In First Out). Queue: FIFO (First In First Out). Deque: ambele capete. Array-backed sau linked list. Aplicații: undo, BFS, DFS.', example: '// Stack cu array\nclass Stack<T> {\n  private items: T[] = [];\n  push(item: T) { this.items.push(item); }\n  pop(): T | undefined { return this.items.pop(); }\n  peek(): T | undefined { return this.items.at(-1); }\n  get size() { return this.items.length; }\n  isEmpty() { return this.items.length === 0; }\n}\n\n// Queue eficientă (O(1) dequeue)\nclass Queue<T> {\n  private items: Record<number, T> = {};\n  private head = 0;\n  private tail = 0;\n  enqueue(item: T) { this.items[this.tail++] = item; }\n  dequeue(): T | undefined {\n    if (this.head === this.tail) return undefined;\n    const item = this.items[this.head];\n    delete this.items[this.head++];\n    return item;\n  }\n}', related: ['linked_list', 'graph_algorithms'] },
  bit_manipulation: { id: 'bit_manipulation', label: 'Bit Manipulation Tricks', category: 'algoritmi', description: 'Operații pe biți pentru soluții O(1). Count bits, check power of 2, XOR pentru duplicate finding, masking.', example: '// Power of 2\nconst isPowerOf2 = (n: number) => n > 0 && (n & (n-1)) === 0;\n\n// Count set bits\nconst countBits = (n: number) => {\n  let count = 0;\n  while (n) { count += n & 1; n >>= 1; }\n  return count;\n};\n\n// XOR — find single number\nconst singleNumber = (nums: number[]) => nums.reduce((a, b) => a ^ b, 0);\n\n// Swap fără variabilă temporară\na ^= b; b ^= a; a ^= b;\n\n// n-th bit set/clear/toggle\nconst setBit = (n: number, i: number) => n | (1 << i);\nconst clearBit = (n: number, i: number) => n & ~(1 << i);\nconst toggleBit = (n: number, i: number) => n ^ (1 << i);', related: ['comma_operator', 'big_o'] },

  // ── Ultimele 74 concepte pentru 500+ ──
  proxy_patterns: { id: 'proxy_patterns', label: 'Proxy & Reflect', category: 'javascript', description: 'Proxy: interceptează operații pe obiecte (get, set, has, delete). Reflect: API pentru operații reflect. Util pentru validare, logging, reactive systems.', example: 'const handler = {\n  get(target: any, prop: string) {\n    return prop in target ? target[prop] : `${prop} not found`;\n  },\n  set(target: any, prop: string, value: any) {\n    if (typeof value !== "number") throw new TypeError("Only numbers!");\n    target[prop] = value;\n    return true;\n  },\n};\nconst proxy = new Proxy({}, handler);\nproxy.x = 42;', related: ['javascript', 'reactivity'] },
  weak_ref: { id: 'weak_ref', label: 'WeakRef & FinalizationRegistry', category: 'javascript', description: 'WeakRef: referință care nu previne garbage collection. FinalizationRegistry: callback la GC al obiectului. Util pentru caches, DOM listeners.', example: 'const cache = new Map<string, WeakRef<BigObject>>();\n\nfunction getOrCreate(key: string): BigObject {\n  const ref = cache.get(key);\n  const cached = ref?.deref();\n  if (cached) return cached;\n  const obj = new BigObject();\n  cache.set(key, new WeakRef(obj));\n  return obj;\n}\n\n// FinalizationRegistry\nconst registry = new FinalizationRegistry((key: string) => {\n  cache.delete(key); // cleanup la GC\n});', related: ['memory_management', 'garbage_collection'] },
  abort_controller: { id: 'abort_controller', label: 'AbortController & AbortSignal', category: 'javascript', description: 'Anulare operații async: fetch, Event Listeners, Promises. AbortController.signal transmis la fetch. addEventListener cu signal pentru auto-cleanup.', example: 'const controller = new AbortController();\nconst { signal } = controller;\n\nfetch("/api/data", { signal })\n  .then(res => res.json())\n  .catch(err => {\n    if (err.name === "AbortError") console.log("Cancelled");\n    else throw err;\n  });\n\n// Cancel după 5s\nsetTimeout(() => controller.abort(), 5000);\n\n// useEffect cleanup\nuseEffect(() => {\n  const ac = new AbortController();\n  fetch("/api/data", { signal: ac.signal }).then(setData);\n  return () => ac.abort(); // cleanup la unmount\n}, []);', related: ['fetch_api', 'useeffect'] },
  observer_api: { id: 'observer_api', label: 'Intersection Observer', category: 'javascript', description: 'Detectează când elementul devine vizibil în viewport. Lazy loading, infinite scroll, analytics. Performant vs scroll event listeners.', example: 'const observer = new IntersectionObserver(\n  (entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        entry.target.classList.add("visible");\n        lazyLoadImage(entry.target as HTMLImageElement);\n        observer.unobserve(entry.target);\n      }\n    });\n  },\n  { threshold: 0.1, rootMargin: "0px 0px 200px 0px" }\n);\n\ndocument.querySelectorAll("[data-lazy]").forEach(el => observer.observe(el));', related: ['performance', 'mutation_observer'] },
  broadcast_channel: { id: 'broadcast_channel', label: 'BroadcastChannel & SharedWorker', category: 'javascript', description: 'BroadcastChannel: comunicare între tab-uri same origin. SharedWorker: worker shared între tab-uri.', example: 'const bc = new BroadcastChannel("app-events");\n\n// Trimite la toate tab-urile\nbc.postMessage({ type: "USER_LOGGED_OUT" });\n\n// Primește în alte tab-uri\nbc.addEventListener("message", (event) => {\n  if (event.data.type === "USER_LOGGED_OUT") {\n    clearUserState();\n    navigate("/login");\n  }\n});\n\n// Cleanup\nbc.close();', related: ['web_workers', 'service_worker'] },
  web_storage: { id: 'web_storage', label: 'Web Storage API', category: 'javascript', description: 'localStorage: persistent, fără expirare. sessionStorage: per-tab, se șterge la close. IndexedDB: bază de date client-side mai complexă.', example: '// localStorage — sincron, max 5-10MB\nlocalStorage.setItem("user", JSON.stringify(user));\nconst user = JSON.parse(localStorage.getItem("user") ?? "null");\nlocalStorage.removeItem("user");\nlocalStorage.clear();\n\n// Helper type-safe\nfunction getStorage<T>(key: string, fallback: T): T {\n  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }\n  catch { return fallback; }\n}', related: ['async_storage', 'secure_store'] },
  custom_events: { id: 'custom_events', label: 'Custom Events (Web)', category: 'javascript', description: 'CustomEvent pentru comunicare loose-coupled în DOM. detail pentru date. dispatchEvent pe document sau element specific.', example: 'const event = new CustomEvent("cart:updated", {\n  detail: { items: cart.items, total: cart.total },\n  bubbles: true,\n  cancelable: true,\n});\ndocument.dispatchEvent(event);\n\n// Listener\ndocument.addEventListener("cart:updated", (e: CustomEvent) => {\n  updateCartUI(e.detail.items, e.detail.total);\n});\n\n// TypeScript — augmentare tip\ndeclare global {\n  interface DocumentEventMap {\n    "cart:updated": CustomEvent<{ items: CartItem[]; total: number }>;\n  }\n}', related: ['event_emitter', 'observer_advanced'] },
  form_data: { id: 'form_data', label: 'FormData & Blob API', category: 'javascript', description: 'FormData: date multipart pentru upload. Blob: date binare browser. URL.createObjectURL pentru preview. File API pentru citire fișiere.', example: 'const formData = new FormData();\nformData.append("name", "Ion");\nformData.append("avatar", fileInput.files[0]);\nawait fetch("/api/profile", { method: "PUT", body: formData });\n\n// File reading\nconst reader = new FileReader();\nreader.onload = (e) => setPreview(e.target!.result as string);\nreader.readAsDataURL(file);\n\n// Blob URL\nconst blob = new Blob([jsonString], { type: "application/json" });\nconst url = URL.createObjectURL(blob);\n// ...\nURL.revokeObjectURL(url); // cleanup!', related: ['multipart_upload', 'expo_file_system'] },
  indexed_db_advanced: { id: 'indexed_db_advanced', label: 'IndexedDB', category: 'javascript', description: 'Baza de date NoSQL în browser. Async, offline-first. idb library pentru API promisified. Stocare structurată, indexuri, transacții.', example: 'import { openDB } from "idb";\n\nconst db = await openDB("myapp-db", 1, {\n  upgrade(db) {\n    const store = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });\n    store.createIndex("date", "createdAt");\n  },\n});\n\nawait db.add("notes", { text: "Hello", createdAt: new Date() });\nconst notes = await db.getAll("notes");\nconst recent = await db.getAllFromIndex("notes", "date");', related: ['local_storage', 'offline_first'] },
  canvas_drawing: { id: 'canvas_drawing', label: 'Canvas API (2D)', category: 'javascript', description: 'Grafică 2D programatică. getContext("2d"): desenare forme, text, imagini. OffscreenCanvas pentru thread worker. Three.js pentru 3D.', example: 'const canvas = document.getElementById("canvas") as HTMLCanvasElement;\nconst ctx = canvas.getContext("2d")!;\n\n// Rectangle\nctx.fillStyle = "#6C63FF";\nctx.fillRect(10, 10, 200, 100);\n\n// Circle\nctx.beginPath();\nctx.arc(100, 100, 50, 0, Math.PI * 2);\nctx.strokeStyle = "#00D4FF";\nctx.lineWidth = 3;\nctx.stroke();\n\n// Text\nctx.font = "bold 24px Inter";\nctx.fillText("Jarvis", 50, 200);\n\n// Image\nconst img = new Image();\nimg.onload = () => ctx.drawImage(img, 0, 0);', related: ['wasm', 'performance'] },
  speech_api: { id: 'speech_api', label: 'Web Speech API', category: 'javascript', description: 'SpeechSynthesis: text-to-speech. SpeechRecognition: voice-to-text. Suport variabil pe browsere. MediaDevices.getUserMedia pentru audio stream.', example: '// Text-to-Speech\nconst utterance = new SpeechSynthesisUtterance("Bună ziua, sunt Jarvis!");\nutterance.lang = "ro-RO";\nutterance.rate = 0.9;\nutterance.pitch = 1;\nwindow.speechSynthesis.speak(utterance);\n\n// Speech-to-Text\nconst recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();\nrecognition.lang = "ro-RO";\nrecognition.continuous = false;\nrecognition.onresult = (e) => {\n  const transcript = e.results[0][0].transcript;\n  processVoiceCommand(transcript);\n};\nrecognition.start();', related: ['expo_speech', 'pwa'] },
  geo_location: { id: 'geo_location', label: 'Geolocation API', category: 'javascript', description: 'Locație utilizator în browser. getCurrentPosition + watchPosition. Opțiuni: enableHighAccuracy, timeout, maximumAge.', example: 'if ("geolocation" in navigator) {\n  navigator.geolocation.getCurrentPosition(\n    (pos) => {\n      const { latitude, longitude, accuracy } = pos.coords;\n      console.log(`${latitude}, ${longitude} (±${accuracy}m)`);\n    },\n    (error) => {\n      switch (error.code) {\n        case error.PERMISSION_DENIED: alert("Accesul la locație a fost refuzat"); break;\n        case error.POSITION_UNAVAILABLE: alert("Locația nu e disponibilă"); break;\n        case error.TIMEOUT: alert("Timeout locație"); break;\n      }\n    },\n    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }\n  );\n}', related: ['expo_location', 'permissions'] },
  notification_api: { id: 'notification_api', label: 'Notifications API (Web)', category: 'javascript', description: 'Push notifications în browser. Necesită permisiune. Service Worker pentru push când app nu e deschis.', example: 'async function requestNotificationPermission() {\n  const permission = await Notification.requestPermission();\n  return permission === "granted";\n}\n\nasync function showNotification(title: string, body: string) {\n  if (Notification.permission !== "granted") return;\n  const n = new Notification(title, {\n    body,\n    icon: "/icon-192.png",\n    badge: "/badge.png",\n    tag: "unique-id", // înlocuiește notificarea precedentă\n    requireInteraction: false,\n  });\n  n.onclick = () => { window.focus(); n.close(); };\n}', related: ['pwa', 'service_worker'] },
  page_visibility: { id: 'page_visibility', label: 'Page Visibility & Focus APIs', category: 'javascript', description: 'document.hidden: tab-ul e ascuns? visibilitychange event. Pauzare animații, video, polling când tab ascuns.', example: 'document.addEventListener("visibilitychange", () => {\n  if (document.hidden) {\n    pauseAnimations();\n    clearInterval(pollingInterval);\n    console.log("Tab ascuns — conservă resurse");\n  } else {\n    resumeAnimations();\n    pollingInterval = setInterval(poll, 30000);\n    syncData(); // sync la revenire\n    console.log("Tab vizibil");\n  }\n});\n\n// Focus/blur\nwindow.addEventListener("focus", () => refreshData());\nwindow.addEventListener("blur", () => saveProgress());', related: ['performance', 'pwa'] },
  // TypeScript Generics Extra
  generic_constraints: { id: 'generic_constraints', label: 'Generic Constraints Avansate', category: 'typescript', description: 'keyof T, typeof, extends keyof, conditional types cu generics. Higher-kinded types simulate. Variadic generics (TS 4.0).', example: 'function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\n// Variadic Generics (TS 4.0)\ntype Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;\n\ntype UnpackTuple<T extends unknown[]> = {\n  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]\n};\n\n// Deep Partial\ntype DeepPartial<T> = T extends object\n  ? { [P in keyof T]?: DeepPartial<T[P]> }\n  : T;', related: ['generics', 'infer_keyword'] },
  type_challenges: { id: 'type_challenges', label: 'Type Gymnastics & Utilities', category: 'typescript', description: 'Flatten, UnionToIntersection, IsNever, IsAny, DeepReadonly. Exerciții type-level programming. type-challenges pe GitHub.', example: 'type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;\ntype Flat1 = Flatten<number[][][]>; // number\n\ntype UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends\n  (k: infer I) => void ? I : never;\ntype UI = UnionToIntersection<{a: string} | {b: number}>;\n// { a: string } & { b: number }\n\ntype IsNever<T> = [T] extends [never] ? true : false;\ntype T1 = IsNever<never>; // true\ntype T2 = IsNever<string>; // false', related: ['infer_keyword', 'conditional_types'] },
  // React Extra
  react_concurrent: { id: 'react_concurrent', label: 'Concurrent Features React', category: 'react', description: 'startTransition, useDeferredValue, Suspense cu data fetching, SuspenseList. Concurrent rendering permite întreruperea render-urilor.', example: 'function SearchResults({ query }: { query: string }) {\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n  \n  const results = useMemo(() => searchData(deferredQuery), [deferredQuery]);\n  \n  return (\n    <div style={{ opacity: isStale ? 0.7 : 1 }}>\n      {results.map(r => <Result key={r.id} data={r} />)}\n    </div>\n  );\n}', related: ['suspense_react', 'use_transition'] },
  use_action: { id: 'use_action', label: 'React Actions (use hook)', category: 'react', description: 'React 19: use() hook pentru Promise și Context. Server Actions pentru form mutations. Optimistic state cu useOptimistic.', example: '// React 19 — use() pentru promisuri\nfunction UserProfile({ id }: { id: string }) {\n  const user = use(fetchUser(id)); // Suspend dacă în așteptare\n  return <div>{user.name}</div>;\n}\n\n// useOptimistic — React 19\nfunction LikeButton({ liked, onLike }: Props) {\n  const [optimisticLiked, toggleOptimistic] = useOptimistic(\n    liked,\n    (state) => !state\n  );\n  return <button onClick={() => { toggleOptimistic(null); onLike(); }}>\n    {optimisticLiked ? "❤️" : "🤍"}\n  </button>;\n}', related: ['suspense_react', 'optimistic_updates'] },
  zustand_persist: { id: 'zustand_persist', label: 'Zustand State Management', category: 'react', description: 'State management ușor pentru React. create() cu immer middleware, devtools, persist. Nu necesită Provider.', example: 'import { create } from "zustand";\nimport { immer } from "zustand/middleware/immer";\n\nconst useAppStore = create(immer<AppState>()((set) => ({\n  count: 0,\n  user: null,\n  increment: () => set(state => { state.count++; }),\n  setUser: (user) => set(state => { state.user = user; }),\n  reset: () => set({ count: 0, user: null }),\n})));\n\n// Selector pentru re-render minimal\nconst count = useAppStore(state => state.count);\nconst increment = useAppStore(state => state.increment);', related: ['state_management', 'state_persistence'] },
  jotai: { id: 'jotai', label: 'Jotai & Atomic State', category: 'react', description: 'Atomic state: fiecare atom e independent. Derivate din alte atomi. React Suspense integration. Mai granular decât Zustand.', example: 'import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";\n\nconst countAtom = atom(0);\nconst doubleAtom = atom(get => get(countAtom) * 2); // derived\n\n// Async atom\nconst userAtom = atom(async () => {\n  const res = await fetch("/api/user");\n  return res.json();\n});\n\nfunction Counter() {\n  const [count, setCount] = useAtom(countAtom);\n  const double = useAtomValue(doubleAtom);\n  return <button onClick={() => setCount(c => c + 1)}>{count} ({double})</button>;\n}', related: ['state_management', 'react_concurrent'] },
  tanstack_query: { id: 'tanstack_query', label: 'TanStack Query (React Query)', category: 'react', description: 'Server state management. useQuery, useMutation, infinite queries. Caching, background refetch, staleTime, retry logic.', example: 'import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\n\nconst { data, isLoading, error } = useQuery({\n  queryKey: ["user", userId],\n  queryFn: () => fetchUser(userId),\n  staleTime: 5 * 60 * 1000, // 5 min\n  retry: 3,\n});\n\nconst qc = useQueryClient();\nconst mutation = useMutation({\n  mutationFn: updateUser,\n  onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),\n});', related: ['hooks', 'optimistic_updates'] },
  // Node.js
  http_streaming: { id: 'http_streaming', label: 'HTTP Streaming & Chunked Transfer', category: 'backend', description: 'Streaming răspuns HTTP: nu aștepți să ai toată data. res.write() + res.end(). Util pentru AI streaming, CSV export, log streaming.', example: 'app.get("/stream", (req, res) => {\n  res.setHeader("Content-Type", "application/octet-stream");\n  res.setHeader("Transfer-Encoding", "chunked");\n  \n  const rows = db.query("SELECT * FROM big_table"); // cursor\n  rows.on("data", (row) => {\n    res.write(JSON.stringify(row) + "\\n");\n  });\n  rows.on("end", () => res.end());\n  rows.on("error", (err) => { res.status(500); res.end(); });\n});', related: ['streaming', 'nodejs'] },
  // Performance
  virtual_dom: { id: 'virtual_dom', label: 'List Virtualization', category: 'performance', description: 'Render doar elementele vizibile din liste mari. @tanstack/virtual, react-window, FlashList. O(1) DOM nodes indiferent de lista size.', example: 'import { useVirtualizer } from "@tanstack/react-virtual";\n\nfunction VirtualList({ items }: { items: Item[] }) {\n  const parentRef = useRef<HTMLDivElement>(null);\n  const virtualizer = useVirtualizer({\n    count: items.length,\n    getScrollElement: () => parentRef.current,\n    estimateSize: () => 72,\n  });\n  return (\n    <div ref={parentRef} style={{ height: 500, overflow: "auto" }}>\n      <div style={{ height: virtualizer.getTotalSize() }}>\n        {virtualizer.getVirtualItems().map(item => (\n          <div key={item.key} style={{ position: "absolute", top: item.start }}>\n            <ItemRow data={items[item.index]} />\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}', related: ['flatlist_performance', 'performance'] },
  // Security
  content_security_policy: { id: 'content_security_policy', label: 'Content Security Policy (CSP)', category: 'securitate', description: 'Header HTTP care restricționează resurse permise. Previne XSS, clickjacking. nonce pentru script-uri inline. Report-Only pentru testing.', example: 'res.setHeader("Content-Security-Policy", [\n  "default-src \'self\'",\n  "script-src \'self\' \'nonce-RANDOM_NONCE\'",\n  "style-src \'self\' \'unsafe-inline\'",\n  "img-src \'self\' data: https://cdn.example.com",\n  "connect-src \'self\' https://api.example.com",\n  "font-src \'self\'",\n  "frame-ancestors \'none\'",\n  "form-action \'self\'",\n].join("; "));\n\n// Report-Only (nu blochează, doar raportează)\nres.setHeader("Content-Security-Policy-Report-Only", "script-src \'self\'; report-uri /csp-report");', related: ['xss_prevention', 'owasp'] },
  security_headers: { id: 'security_headers', label: 'Security HTTP Headers', category: 'securitate', description: 'X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS. Helmet.js le setează automat.', example: 'import helmet from "helmet";\n\napp.use(helmet()); // toate headers de securitate\n\n// Sau manual:\nres.setHeader("X-Frame-Options", "DENY"); // anti-clickjacking\nres.setHeader("X-Content-Type-Options", "nosniff"); // MIME sniffing\nres.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");\nres.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");\nres.setHeader("X-DNS-Prefetch-Control", "off");', related: ['content_security_policy', 'https_ssl'] },
  // Algorithms
  flood_fill: { id: 'flood_fill', label: 'Flood Fill & Connected Components', category: 'algoritmi', description: 'Umple regiune din matrice (paint bucket). DFS/BFS din punct start, schimbă culoarea celulelor adiacente similare.', example: 'function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {\n  const oldColor = image[sr][sc];\n  if (oldColor === color) return image;\n  \n  function fill(r: number, c: number) {\n    if (r < 0 || r >= image.length || c < 0 || c >= image[0].length) return;\n    if (image[r][c] !== oldColor) return;\n    image[r][c] = color;\n    fill(r+1, c); fill(r-1, c); fill(r, c+1); fill(r, c-1);\n  }\n  fill(sr, sc);\n  return image;\n}', related: ['dfs', 'bfs'] },
  knapsack: { id: 'knapsack', label: 'Knapsack Problem', category: 'algoritmi', description: 'DP clasic: maximizează valoarea cu greutate limitată. 0/1 knapsack O(n*W). Unbounded knapsack (repetare obiecte permisă).', example: 'function knapsack01(weights: number[], values: number[], capacity: number): number {\n  const n = weights.length;\n  const dp = Array.from({length: n+1}, () => new Array(capacity+1).fill(0));\n  \n  for (let i = 1; i <= n; i++) {\n    for (let w = 0; w <= capacity; w++) {\n      dp[i][w] = dp[i-1][w]; // nu includem item i\n      if (weights[i-1] <= w) {\n        dp[i][w] = Math.max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1]);\n      }\n    }\n  }\n  return dp[n][capacity];\n}', related: ['dynamic_programming', 'greedy'] },
  lcs: { id: 'lcs', label: 'LCS & Edit Distance', category: 'algoritmi', description: 'LCS (Longest Common Subsequence): O(m*n). Edit Distance (Levenshtein): min operații pentru a transforma un string în altul. Diff algorithms, spell check.', example: 'function editDistance(s1: string, s2: string): number {\n  const m = s1.length, n = s2.length;\n  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i || j));\n  \n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1];\n      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n    }\n  }\n  return dp[m][n];\n}', related: ['dynamic_programming', 'sliding_window'] },
  quick_sort: { id: 'quick_sort', label: 'QuickSort & MergeSort', category: 'algoritmi', description: 'QuickSort: O(n log n) mediu, O(n²) worst. MergeSort: O(n log n) guaranteed, stable. QuickSelect pentru k-th element O(n) mediu.', example: 'function quicksort(arr: number[], low = 0, high = arr.length - 1): void {\n  if (low >= high) return;\n  const pivot = partition(arr, low, high);\n  quicksort(arr, low, pivot - 1);\n  quicksort(arr, pivot + 1, high);\n}\n\nfunction partition(arr: number[], low: number, high: number): number {\n  const pivot = arr[high];\n  let i = low - 1;\n  for (let j = low; j < high; j++) {\n    if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }\n  }\n  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];\n  return i + 1;\n}', related: ['sortare', 'big_o'] },
  consistent_hashing: { id: 'consistent_hashing', label: 'Consistent Hashing', category: 'algoritmi', description: 'Hashing pentru distribuite uniform. Adăugare/eliminare node-uri afectează minim keys. Load balancing, distributed caches (memcached).', example: '// Consistent Hashing ring\nclass ConsistentHash {\n  private ring = new Map<number, string>();\n  private REPLICAS = 150; // virtual nodes\n\n  addNode(node: string) {\n    for (let i = 0; i < this.REPLICAS; i++) {\n      const hash = this.hash(`${node}:${i}`);\n      this.ring.set(hash, node);\n    }\n  }\n\n  getNode(key: string): string {\n    const hash = this.hash(key);\n    const keys = [...this.ring.keys()].sort((a,b) => a-b);\n    const target = keys.find(k => k >= hash) ?? keys[0];\n    return this.ring.get(target)!;\n  }\n}', related: ['hash_table', 'microservices'] },
  // React Native
  use_animated_value: { id: 'use_animated_value', label: 'Animated API (Built-in)', category: 'react-native', description: 'Animated.Value, Animated.View. timing, spring, decay animations. Interpolate pentru mapare valori. Mai puțin performant decât Reanimated.', example: 'const opacity = useRef(new Animated.Value(0)).current;\n\nfunction fadeIn() {\n  Animated.timing(opacity, {\n    toValue: 1,\n    duration: 300,\n    useNativeDriver: true, // ÎNTOTDEAUNA true dacă posibil\n  }).start();\n}\n\n// Sequence + Parallel\nAnimated.sequence([\n  Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),\n  Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),\n]).start(() => onComplete());', related: ['reanimated', 'animated_rn'] },
  rn_navigation_deep: { id: 'rn_navigation_deep', label: 'Deep Linking Navigation', category: 'react-native', description: 'Expo Router: deep links automat din file structure. Universal links (iOS), App Links (Android). Scheme custom: jarvis://screen.', example: '// app.json\n{\n  "expo": {\n    "scheme": "jarvis",\n    "android": { "intentFilters": [{ "action": "VIEW", "data": [{ "scheme": "https", "host": "jarvis.app" }] }] }\n  }\n}\n\n// Expo Router — link automat\n// jarvis://profile/123 → app/profile/[id].tsx\n\n// Recepție\nimport { useURL } from "expo-linking";\nconst url = useURL();\n\n// Deschide din app\nimport { Linking } from "react-native";\nawait Linking.openURL("jarvis://chat");', related: ['expo_router', 'react_navigation'] },
  // Full text
  vector_search: { id: 'vector_search', label: 'Semantic Search Implementation', category: 'ai', description: 'Embedding text → vector. Căutare prin cosine similarity. Pipeline: chunk text → embed → store în vector DB → query.', example: 'async function semanticSearch(query: string, topK = 5) {\n  // Embed query\n  const queryEmbedding = await embed(query); // float[1536]\n  \n  // Căutare în vector DB (pgvector)\n  const results = await db.execute(sql`\n    SELECT id, content, 1 - (embedding <=> ${queryEmbedding}::vector) AS similarity\n    FROM documents\n    ORDER BY embedding <=> ${queryEmbedding}::vector\n    LIMIT ${topK}\n  `);\n  \n  return results.rows.filter(r => r.similarity > 0.7);\n}', related: ['rag', 'vector_database'] },
  llm_costs: { id: 'llm_costs', label: 'LLM Cost Optimization', category: 'ai', description: 'Tokens = bani. Optimizare: context windows mici, prompt compression, caching răspunsuri, modele mai mici pentru task-uri simple, batching.', example: '// Costuri approximate (GPT-4o):\n// Input: $2.50/1M tokens\n// Output: $10/1M tokens\n// 1 token ≈ 4 chars engleza\n\n// Strategii:\n// 1. Cache semantic (embeddings pentru similar queries)\n// 2. Prompt compression (llmlingua)\n// 3. Modele mici: gpt-4o-mini pentru clasificare\n// 4. Streaming pentru UX bun fără timeout\n// 5. Context management: rezumat conversații lungi\n\n// Tracking costuri\nconst tokens = response.usage.total_tokens;\nconst costUSD = (tokens / 1000000) * 10; // output rate', related: ['llm_api', 'prompt_engineering'] },
  langchain: { id: 'langchain', label: 'LangChain & LangGraph', category: 'ai', description: 'Framework pentru aplicații LLM: chains, memory, tools, agents. LangGraph: state machines pentru agenți complecși.', example: 'import { ChatOpenAI } from "@langchain/openai";\nimport { PromptTemplate } from "@langchain/core/prompts";\nimport { LLMChain } from "langchain/chains";\n\nconst model = new ChatOpenAI({ model: "gpt-4o-mini" });\nconst prompt = PromptTemplate.fromTemplate(\n  "Explică {concept} simplu pentru un {audience}"\n);\nconst chain = new LLMChain({ llm: model, prompt });\n\nconst result = await chain.call({\n  concept: "recursivitate",\n  audience: "copil de 10 ani",\n});', related: ['llm_api', 'ai_agents'] },
  // DevOps Extra
  helm_charts: { id: 'helm_charts', label: 'Helm Charts', category: 'devops', description: 'Package manager pentru Kubernetes. Chart = template Kubernetes. Values pentru configurare per environment. Release management.', example: '# Chart.yaml\nname: myapp\nversion: 1.0.0\n\n# values.yaml\nimage:\n  repository: ghcr.io/myorg/myapp\n  tag: v1.2.0\nreplicaCount: 3\nresources:\n  requests:\n    memory: 128Mi\n    cpu: 100m\n\n# templates/deployment.yaml\nspec:\n  replicas: {{ .Values.replicaCount }}\n  template:\n    spec:\n      containers:\n      - image: {{ .Values.image.repository }}:{{ .Values.image.tag }}\n\n# Deploy\nhelm install myapp ./chart --values prod-values.yaml', related: ['kubernetes', 'terraform'] },
  tracing: { id: 'tracing', label: 'Distributed Tracing (OpenTelemetry)', category: 'devops', description: 'Trace request-uri prin multiple servicii. Spans, traces, context propagation. OpenTelemetry = standard. Jaeger, Zipkin, DataDog.', example: 'import { NodeSDK } from "@opentelemetry/sdk-node";\nimport { JaegerExporter } from "@opentelemetry/exporter-jaeger";\n\nconst sdk = new NodeSDK({\n  traceExporter: new JaegerExporter({ endpoint: "http://jaeger:14268/api/traces" }),\n  instrumentations: [\n    new HttpInstrumentation(),\n    new ExpressInstrumentation(),\n    new PgInstrumentation(),\n  ],\n});\nsdk.start();\n\n// Manual span\nconst tracer = trace.getTracer("my-service");\nconst span = tracer.startSpan("processOrder");\nspan.setAttribute("order.id", orderId);\ntry { await processOrder(); } finally { span.end(); }', related: ['monitoring', 'microservices'] },
  // Architecture
  actor_model: { id: 'actor_model', label: 'Actor Model', category: 'architecture', description: 'Actors: unități de calcul care comunică prin mesaje. Erlang, Akka, Elixir. Fiecare actor are o mailbox. Nu share state, nu mutex.', example: '// Simplificat cu worker threads\nclass Actor {\n  private mailbox: any[] = [];\n  private processing = false;\n  \n  async send(message: any) {\n    this.mailbox.push(message);\n    if (!this.processing) this.process();\n  }\n  \n  private async process() {\n    this.processing = true;\n    while (this.mailbox.length > 0) {\n      const msg = this.mailbox.shift();\n      await this.receive(msg);\n    }\n    this.processing = false;\n  }\n  \n  protected async receive(message: any) { /* override */ }\n}', related: ['microservices', 'event_driven'] },
  anti_patterns: { id: 'anti_patterns', label: 'Anti-Patterns de Evitat', category: 'architecture', description: 'God Object, Spaghetti Code, Golden Hammer, Cargo Cult, Premature Optimization, Copy-Paste Programming, Magic Numbers.', example: '// Anti-pattern: God Object\nclass App { /* 2000 linii, face totul */ }\n\n// Anti-pattern: Magic Numbers\nif (status === 3) { /* ce e 3? */ }\n// Soluție:\nconst STATUS = { PENDING: 1, ACTIVE: 2, ARCHIVED: 3 };\nif (status === STATUS.ARCHIVED) { /* clar! */ }\n\n// Anti-pattern: Premature optimization\n// Nu optimiza înainte de a profile!\n\n// Anti-pattern: Callback hell → async/await\n// Anti-pattern: Singleton overuse → DI\n// Anti-pattern: Long parameter lists → object params', related: ['oop_principles', 'clean_architecture'] },
  specification_pattern: { id: 'specification_pattern', label: 'Specification Pattern', category: 'design-patterns', description: 'Encapsulează logica de business în obiecte combinabile. And, Or, Not. Refolosibil, testabil, declarativ.', example: 'interface Specification<T> {\n  isSatisfiedBy(candidate: T): boolean;\n  and(other: Specification<T>): Specification<T>;\n  or(other: Specification<T>): Specification<T>;\n  not(): Specification<T>;\n}\n\nclass ActiveUserSpec implements Specification<User> {\n  isSatisfiedBy(u: User) { return u.isActive; }\n}\nclass PremiumUserSpec implements Specification<User> {\n  isSatisfiedBy(u: User) { return u.plan === "premium"; }\n}\n\nconst activePremium = new ActiveUserSpec().and(new PremiumUserSpec());\nconst eligibleUsers = users.filter(u => activePremium.isSatisfiedBy(u));', related: ['design-patterns', 'pure_functions'] },
  // Mobile
  rn_image_picker: { id: 'rn_image_picker', label: 'Image Picker (expo-image-picker)', category: 'react-native', description: 'Selectează imagini/video din galerie sau camera. Crop, compresie, multiple selection. Cerere permisiuni automată.', example: 'import * as ImagePicker from "expo-image-picker";\n\nasync function pickImage() {\n  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();\n  if (status !== "granted") throw new Error("Permisiune necesară");\n  \n  const result = await ImagePicker.launchImageLibraryAsync({\n    mediaTypes: ImagePicker.MediaTypeOptions.Images,\n    allowsEditing: true,\n    aspect: [4, 3],\n    quality: 0.8,\n    allowsMultipleSelection: true,\n  });\n  \n  if (!result.canceled) {\n    const { uri, width, height } = result.assets[0];\n    return { uri, width, height };\n  }\n}', related: ['expo_camera_api', 'permissions'] },
  expo_secure_store_adv: { id: 'expo_secure_store_adv', label: 'SecureStore Advanced', category: 'react-native', description: 'Stocare criptată cu biometrics. Opțiuni: requireAuthentication, keychainService. Diferite pe iOS (Keychain) vs Android (Keystore).', example: 'import * as SecureStore from "expo-secure-store";\n\nconst KEYS = {\n  AUTH_TOKEN: "auth_token",\n  PIN_HASH: "pin_hash",\n  AI_PROVIDER_KEY: "ai_provider_key",\n};\n\nasync function saveWithBiometrics(key: string, value: string) {\n  await SecureStore.setItemAsync(key, value, {\n    requireAuthentication: true, // biometrics/PIN required\n    authenticationPrompt: "Autentificare necesară pentru acces",\n    keychainService: "ro.jarvis.app",\n  });\n}\n\nasync function deleteAll() {\n  await Promise.all(Object.values(KEYS).map(k => SecureStore.deleteItemAsync(k)));\n}', related: ['secure_store', 'biometrics'] },
  // CSS/Styling
  tailwind_advanced: { id: 'tailwind_advanced', label: 'Tailwind Arbitrary Values & Plugins', category: 'styling', description: 'Arbitrary values: w-[328px], bg-[#6C63FF]. @apply pentru extragere clase. Plugins pentru componente custom.', example: '// Arbitrary values\n<div className="w-[328px] bg-[#6C63FF] text-[0.875rem]" />\n\n// @apply în CSS\n.btn-primary {\n  @apply px-4 py-2 rounded-xl bg-violet-600 text-white font-medium;\n  @apply hover:bg-violet-700 active:scale-95 transition-all duration-200;\n}\n\n// Plugin custom\n// tailwind.config.js\nplugin(function({ addComponents }) {\n  addComponents({\n    ".glass": {\n      background: "rgba(255,255,255,0.05)",\n      backdropFilter: "blur(10px)",\n      border: "1px solid rgba(255,255,255,0.1)",\n    }\n  })\n})', related: ['tailwind', 'css_variables'] },
  grid_layout: { id: 'grid_layout', label: 'CSS Grid Avansat', category: 'styling', description: 'grid-template-areas, auto-fit, auto-fill, minmax, subgrid. Layout complex 2D. Named lines. Dense packing.', example: '.layout {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar content"\n    "footer footer";\n  grid-template-rows: auto 1fr auto;\n  grid-template-columns: 250px 1fr;\n  min-height: 100vh;\n}\n\n.header { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.content { grid-area: content; }\n\n/* Auto responsive */\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 16px;\n}', related: ['css_grid', 'media_queries'] },
  flexbox_patterns: { id: 'flexbox_patterns', label: 'Flexbox Patterns Uzuale', category: 'styling', description: 'Sticky footer, centering, holy grail layout, nav bar. Gap pentru spacing. flex-wrap, flex-shrink, flex-grow.', example: '/* Centering vertical + horizontal */\n.center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n/* Sticky footer */\nbody { display: flex; flex-direction: column; min-height: 100vh; }\nfooter { margin-top: auto; }\n\n/* Nav bar */\nnav {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\nnav .spacer { flex: 1; } /* push dreapta */\n\n/* Prevent shrink */\n.icon { flex-shrink: 0; }', related: ['css_grid', 'grid_layout'] },
  // Full final to 500+
  monorepo_deps: { id: 'monorepo_deps', label: 'Monorepo Dependency Strategy', category: 'tools', description: 'Shared deps în root. Package-specific în pachet. Internal packages cu workspace:*. peer deps pentru librării. Lockfile commitment.', example: '# pnpm workspace — intern\n# apps/web/package.json\n{\n  "dependencies": {\n    "@myorg/ui": "workspace:*",  // intern\n    "react": "^18.0.0",          // specific\n  }\n}\n\n# packages/ui/package.json\n{\n  "peerDependencies": {\n    "react": ">=17.0.0"  // nu include, lasă app să declare\n  }\n}\n\n# root/package.json\n{\n  "devDependencies": {\n    "typescript": "^5.0.0"  // shared dev dep\n  }\n}', related: ['monorepo', 'npm_yarn_pnpm'] },
  barrel_exports: { id: 'barrel_exports', label: 'Barrel Exports & Module Structure', category: 'tools', description: 'index.ts care re-exportă dintr-un folder. Simplifică imports. Problemă: bundler nu poate tree-shake fără "sideEffects": false.', example: '// components/index.ts — barrel\nexport { Button } from "./Button";\nexport { Input } from "./Input";\nexport { Modal } from "./Modal";\nexport type { ButtonProps } from "./Button";\n\n// Utilizare\nimport { Button, Input } from "@myorg/ui";\n// vs\nimport { Button } from "@myorg/ui/Button"; // better pentru tree shaking\n\n// package.json pentru treeshake\n{\n  "sideEffects": false, // safe to tree-shake\n  "exports": { "./Button": "./dist/Button.js" }\n}', related: ['module_system', 'barrel_exports'] },
  bundler_config: { id: 'bundler_config', label: 'Vite Config Avansat', category: 'tools', description: 'resolve.alias, build.rollupOptions, plugins, define, optimizeDeps, server.proxy, preview.port.', example: '// vite.config.ts\nimport { defineConfig } from "vite";\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n      "@components": path.resolve(__dirname, "./src/components"),\n    },\n  },\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ["react", "react-dom"],\n          router: ["react-router-dom"],\n        }\n      }\n    },\n    target: "esnext",\n    sourcemap: true,\n  },\n  server: {\n    port: parseInt(process.env.PORT ?? "3000"),\n    host: true,\n    proxy: { "/api": "http://localhost:3001" },\n  },\n});', related: ['vite', 'monorepo'] },
  prettier_eslint: { id: 'prettier_eslint', label: 'ESLint & Prettier Config', category: 'tools', description: 'ESLint pentru linting (erori logice). Prettier pentru formatare (stilistic). eslint-config-prettier dezactivează reguli conflictuale.', example: '// .eslintrc.json\n{\n  "extends": [\n    "eslint:recommended",\n    "plugin:@typescript-eslint/recommended",\n    "plugin:react-hooks/recommended",\n    "prettier"\n  ],\n  "rules": {\n    "no-console": "warn",\n    "@typescript-eslint/no-explicit-any": "error",\n    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]\n  }\n}\n\n// .prettierrc\n{\n  "semi": true,\n  "singleQuote": false,\n  "tabWidth": 2,\n  "trailingComma": "es5",\n  "printWidth": 100\n}', related: ['typescript_config', 'ci_cd'] },
  commitizen: { id: 'commitizen', label: 'Conventional Commits & Git Hooks', category: 'tools', description: 'Conventional Commits: feat, fix, docs, chore, refactor, test. Commitizen pentru CLI guided commits. Husky + lint-staged pentru pre-commit.', example: '# Conventional Commits\ngit commit -m "feat(auth): add biometric login"\ngit commit -m "fix(chat): resolve message duplication"\ngit commit -m "docs: update API documentation"\ngit commit -m "chore: update dependencies"\n\n# Husky setup\nnpx husky init\n\n# .husky/pre-commit\nnpx lint-staged\n\n# package.json\n"lint-staged": {\n  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],\n  "*.{json,md}": "prettier --write"\n}', related: ['git_advanced', 'ci_cd'] },
  sonarqube: { id: 'sonarqube', label: 'SonarQube & Code Quality Metrics', category: 'tools', description: 'Static code analysis: bugs, vulnerabilities, code smells, duplications, coverage. Quality Gates în CI. SonarCloud pentru cloud.', example: '# GitHub Action cu SonarCloud\n- uses: SonarSource/sonarcloud-github-action@master\n  env:\n    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}\n  with:\n    args: >\n      -Dsonar.projectKey=myproject\n      -Dsonar.organization=myorg\n      -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info\n\n# sonar-project.properties\nsonar.projectName=My App\nsonar.sources=src\nsonar.tests=src\nsonar.test.inclusions=**/*.test.ts', related: ['testing', 'ci_cd'] },
  husky: { id: 'husky', label: 'Git Workflows (Branching)', category: 'tools', description: 'GitFlow: main, develop, feature, release, hotfix. GitHub Flow: main + feature branches. Trunk-based: commituri direct pe main, feature flags.', example: '# GitHub Flow (recomandat pentru CD)\nmain ─── feature/auth ─── PR ─── merge\n     └── fix/login-bug ── PR ─── merge\n\n# GitFlow (pentru release cycles)\nmain (production)\n  └── develop\n        ├── feature/new-feature\n        └── release/v2.0\n              └── hotfix/critical-bug\n\n# Branch naming\ngit checkout -b feat/user-authentication\ngit checkout -b fix/TICKET-123-login-redirect\ngit checkout -b chore/update-dependencies', related: ['git_advanced', 'ci_cd'] },
  // AI Extra
  tokenization: { id: 'tokenization', label: 'Tokenization & Embeddings', category: 'ai', description: 'Tokenizer transformă text în tokens (subword units). Embeddings: reprezentare vectorială a sensului. Sentence embeddings pentru semantic similarity.', example: '// OpenAI embeddings\nconst embedding = await openai.embeddings.create({\n  model: "text-embedding-3-small",\n  input: "Care e diferența dintre TypeScript și JavaScript?",\n});\nconst vector = embedding.data[0].embedding; // float[1536]\n\n// Cosine similarity\nfunction cosineSimilarity(a: number[], b: number[]): number {\n  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);\n  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai**2, 0));\n  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi**2, 0));\n  return dot / (magA * magB);\n}', related: ['embeddings', 'vector_database'] },
  context_window: { id: 'context_window', label: 'Context Window Management', category: 'ai', description: 'Context window = max tokens per request. GPT-4: 128K, Claude: 200K. Strategies: summarization, sliding window, RAG pentru documente mari.', example: '// Sliding window pentru conversații lungi\nfunction truncateHistory(messages: Message[], maxTokens: number): Message[] {\n  const systemMsg = messages[0]; // păstrează system prompt\n  const userMessages = messages.slice(1);\n  \n  let total = countTokens(systemMsg.content);\n  const kept: Message[] = [];\n  \n  // Merge de la final (cele mai recente)\n  for (let i = userMessages.length - 1; i >= 0; i--) {\n    const tokens = countTokens(userMessages[i].content);\n    if (total + tokens > maxTokens) break;\n    kept.unshift(userMessages[i]);\n    total += tokens;\n  }\n  return [systemMsg, ...kept];\n}', related: ['prompt_engineering', 'rag'] },
  guardrails: { id: 'guardrails', label: 'LLM Guardrails & Safety', category: 'ai', description: 'Input validation (injection detection), output filtering (PII, harmful content), rate limiting, content moderation, prompt injection detection.', example: 'async function safeChat(userInput: string, systemPrompt: string): Promise<string> {\n  // 1. Validare input\n  if (userInput.length > 10000) throw new Error("Input prea lung");\n  if (containsPromptInjection(userInput)) throw new Error("Input suspect");\n  \n  // 2. Apel LLM\n  const response = await llm.complete({ messages: [\n    { role: "system", content: systemPrompt },\n    { role: "user", content: sanitize(userInput) },\n  ]});\n  \n  // 3. Filtrare output\n  const filtered = removePII(response);\n  if (containsHarmfulContent(filtered)) throw new Error("Conținut nepotrivit");\n  return filtered;\n}', related: ['prompt_engineering', 'securitate'] },
  // Extra Database
  pagination: { id: 'pagination', label: 'Cursor vs Offset Pagination', category: 'database', description: 'Offset: LIMIT/OFFSET simplu dar lent pe date mari (skip rows). Cursor: bazat pe ultima valoare văzută, O(log n) consistent.', example: '-- Offset (simplu dar lent la page mare)\nSELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 200;\n-- Problemă: OFFSET 200 → DB scanează 200 rows!\n\n-- Cursor (eficient, consistent)\nSELECT * FROM posts\nWHERE created_at < $lastSeenDate -- cursor\nORDER BY created_at DESC\nLIMIT 20;\n-- Utilizează indexul eficient!', related: ['query_optimization', 'infinite_scroll'] },
  schema_migrations: { id: 'schema_migrations', label: 'Schema Migrations Best Practices', category: 'database', description: 'Migrare backward-compatible: add column nullable, backfill, add constraint, drop old. Expand/Contract pattern. Rollback strategy.', example: '-- Expand/Contract pentru rename column\n-- Step 1: Expand — adaugă coloana nouă\nALTER TABLE users ADD COLUMN full_name TEXT;\nUPDATE users SET full_name = name;\n\n-- Step 2: Deploy cod nou care scrie în ambele\n-- Step 3: Migrare restante\nUPDATE users SET full_name = name WHERE full_name IS NULL;\n\n-- Step 4: Contract — remove old after stable\nALTER TABLE users DROP COLUMN name;\n-- Nu face RENAME direct — risc downtime!\n\n-- Drizzle migrate\nnpx drizzle-kit push\nnpx drizzle-kit migrate', related: ['drizzle_orm', 'ci_cd'] },
  data_modeling: { id: 'data_modeling', label: 'Data Modeling Patterns', category: 'database', description: 'Entity-Relationship model. One-to-Many, Many-to-Many (junction table), polymorphic. JSONB pentru schema flexibilă. Partitioning.', example: '-- Many-to-Many — junction table\nCREATE TABLE user_roles (\n  user_id UUID REFERENCES users(id) ON DELETE CASCADE,\n  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,\n  granted_at TIMESTAMPTZ DEFAULT NOW(),\n  PRIMARY KEY (user_id, role_id)\n);\n\n-- Polymorphic — cu discriminator\nCREATE TABLE notifications (\n  id UUID PRIMARY KEY,\n  user_id UUID REFERENCES users(id),\n  type TEXT CHECK (type IN ("email","push","sms")),\n  payload JSONB -- structura variaza per type\n);', related: ['postgresql', 'database_normalization'] },
  // Extra Web
  service_worker_advanced: { id: 'service_worker_advanced', label: 'Service Worker Advanced', category: 'web', description: 'Cache strategies: Cache First, Network First, Stale-While-Revalidate. Background Sync. Push notifications. Interceptează toate requesturile.', example: '// Service Worker — Stale-While-Revalidate\nself.addEventListener("fetch", (event) => {\n  event.respondWith((\n    async () => {\n      const cache = await caches.open("v1");\n      const cached = await cache.match(event.request);\n      \n      const networkFetch = fetch(event.request).then(response => {\n        cache.put(event.request, response.clone());\n        return response;\n      });\n      \n      return cached ?? networkFetch; // cached imediat, update în background\n    }\n  )());\n});', related: ['pwa', 'offline_first'] },
  streams_api: { id: 'streams_api', label: 'Streams API (Web)', category: 'web', description: 'ReadableStream, WritableStream, TransformStream. Procesare incrementală date mari. fetch() returnează ReadableStream. Pipe chains.', example: 'const response = await fetch("/api/large-data");\nconst reader = response.body!.getReader();\nconst decoder = new TextDecoder();\n\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  const chunk = decoder.decode(value, { stream: true });\n  processChunk(chunk);\n}\n\n// Transform stream\nconst csvToJson = new TransformStream({\n  transform(chunk, controller) {\n    const rows = chunk.split("\\n").map(row => row.split(","));\n    controller.enqueue(JSON.stringify(rows));\n  }\n});', related: ['fetch_api', 'streaming'] },
  // TypeScript
  template_types: { id: 'template_types', label: 'Template Literal Types Avansate', category: 'typescript', description: 'Combinare template literals cu mapped types. EventNames din string union. CSS property types. Route types.', example: 'type HttpMethod = "get" | "post" | "put" | "delete";\ntype ApiRoute = `/api/${string}`;\n\ntype MethodRoute = `${Uppercase<HttpMethod>} ${ApiRoute}`;\n// "GET /api/..." | "POST /api/..." | ...\n\n// CSS Properties\ntype Direction = "top" | "right" | "bottom" | "left";\ntype PaddingProp = `padding-${Direction}`; // "padding-top" | ...\n\n// Event emitter type-safe\ntype Events = { click: MouseEvent; keydown: KeyboardEvent };\ntype EventHandler<T extends keyof Events> = (e: Events[T]) => void;\ntype OnEvents = { [K in keyof Events as `on${Capitalize<K>}`]: EventHandler<K> };', related: ['template_literal_types', 'mapped_types'] },
  override_keyword: { id: 'override_keyword', label: 'override & abstract (TS)', category: 'typescript', description: 'override: marchează explicit că suprascrii o metodă. abstract: clasa/metoda trebuie implementată în subclasă. Eroare dacă metoda nu există în bază.', example: 'abstract class Animal {\n  abstract makeSound(): string; // trebuie implementat\n  move() { return "moving..."; } // opțional override\n}\n\nclass Dog extends Animal {\n  override makeSound() { return "woof!"; } // override explicit\n  override move() { return "running!"; }\n}\n\n// Detectează rename-uri greșite\nclass Cat extends Animal {\n  override makeSoond() {} // ERROR: nu există makeSoond în Animal!\n}', related: ['inheritance', 'typescript_basics'] },
  // React Native
  share_api: { id: 'share_api', label: 'Share API React Native', category: 'react-native', description: 'React Native Share: share text, URL, base64 content. Native share sheet iOS/Android.', example: 'import { Share } from "react-native";\n\nasync function shareContent(title: string, message: string, url?: string) {\n  const result = await Share.share({\n    title,\n    message,\n    url, // iOS only\n  });\n  \n  if (result.action === Share.sharedAction) {\n    if (result.activityType) {\n      console.log("Shared via:", result.activityType);\n    } else {\n      console.log("Shared!");\n    }\n  } else if (result.action === Share.dismissedAction) {\n    console.log("Share dismissed");\n  }\n}', related: ['expo_sharing', 'react_native'] },
  rn_accessibility: { id: 'rn_accessibility', label: 'Accessibility în React Native', category: 'react-native', description: 'accessibilityLabel, accessibilityHint, accessibilityRole, accessible. VoiceOver (iOS), TalkBack (Android). Contrast ratio.', example: '<TouchableOpacity\n  accessible={true}\n  accessibilityLabel="Trimite mesaj"\n  accessibilityHint="Trimite mesajul curent în chat"\n  accessibilityRole="button"\n  accessibilityState={{ disabled: !hasInput }}\n  onPress={sendMessage}\n>\n  <Feather name="send" size={24} />\n</TouchableOpacity>\n\n// Text scaling\nconst fontSize = useFontSize(); // PixelRatio.getFontScale()\n<Text style={{ fontSize: 16 * fontScale }} allowFontScaling={true} />', related: ['accessibility', 'react_native'] },
  // Performance
  service_worker_cache: { id: 'service_worker_cache', label: 'React Native Bundle Optimization', category: 'performance', description: 'EAS Build profiling. Metro bundle analyzer. Lazy imports. Tree shaking. hermes bytecode. RAM bundle (indexed) pentru startup rapid.', example: '// Bundle size analysis\nnpx react-native-bundle-visualizer\n\n// app.json — Hermes (JS engine optimizat pentru RN)\n{\n  "expo": {\n    "android": { "jsEngine": "hermes" },\n    "ios": { "jsEngine": "hermes" }\n  }\n}\n\n// Lazy load screen-uri grele\nconst HeavyScreen = lazy(() => import("./screens/HeavyScreen"));\n\n// Evită imports din librării mari\nimport debounce from "lodash/debounce"; // bine\nimport _ from "lodash"; // rău — importă tot lodash', related: ['performance', 'expo'] },
  // Cloud
  multi_region: { id: 'multi_region', label: 'Multi-Region Architecture', category: 'cloud', description: 'Deployuri în multiple regiuni pentru latentă mică și failover. Active-Active vs Active-Passive. Database replication, global CDN.', example: '// Active-Active multi-region\n// - Fiecare regiune servește trafic (EU, US, APAC)\n// - Database: CockroachDB, PlanetScale, Neon (multi-region)\n// - Sessions: Redis Global (Upstash)\n// - CDN: Cloudflare în fața tuturor\n\n// Routing GeoDNS\n// User din Bucuresti → eu-central-1 (Frankfurt)\n// User din NY → us-east-1\n// User din Tokyo → ap-northeast-1\n\n// Edge computing (Cloudflare Workers):\n// Rulează la 200+ POP-uri, <50ms latentă globală', related: ['cdn', 'kubernetes'] },

  // ── Final 8 concepte → 500+ DEV_CONCEPTS ──
  defer_js: { id: 'defer_js', label: 'Script Loading Strategies', category: 'performance', description: 'async: descarcă și execută imediat. defer: descarcă, execută după DOM parse. type=module: defer implicit. Ordinea contează!', example: '<!-- Blocking — BAD -->\n<script src="app.js"></script>\n\n<!-- async — execută imediat după download -->\n<script async src="analytics.js"></script>\n\n<!-- defer — execută după DOM, în ordine -->\n<script defer src="vendor.js"></script>\n<script defer src="app.js"></script>\n\n<!-- Module — defer automat -->\n<script type="module" src="main.js"></script>', related: ['performance', 'critical_css'] },
  symbols: { id: 'symbols', label: 'Symbol Type', category: 'javascript', description: 'Valori unice și imutabile. Useful pentru property keys private, protocol extensions (Symbol.iterator, Symbol.toPrimitive). Global registry cu Symbol.for().', example: 'const id = Symbol("id");\nconst obj = { [id]: 123, name: "Ion" };\nobj[id]; // 123 — nu apare în Object.keys()\nJSON.stringify(obj); // {"name":"Ion"} — omite Symbol\n\nconst a = Symbol("shared");\nconst b = Symbol.for("shared"); // global registry\nconst c = Symbol.for("shared");\nb === c; // true (același din registry)\na === b; // false (local vs global)', related: ['symbol_iterator', 'map_type'] },
  promise_resolve: { id: 'promise_resolve', label: 'Promise.resolve & Thenable', category: 'javascript', description: 'Promise.resolve(val): wrap value în Promise. Thenable: orice obiect cu .then(). Util pentru normaliza valori sincrone/asincrone.', example: 'async function ensureAsync<T>(val: T | Promise<T>): Promise<T> {\n  return Promise.resolve(val);\n}\n\n// Promise.reject\nconst failed = Promise.reject(new Error("ceva a mers prost"));\nfailed.catch(err => console.error(err));\n\n// Thenable — orice obiect cu .then()\nconst thenable = {\n  then(resolve: Function) { resolve(42); }\n};\nawait thenable; // 42', related: ['promise', 'async_await'] },
  generator_patterns: { id: 'generator_patterns', label: 'Generator Patterns Practice', category: 'javascript', description: 'Generators pentru paginator, infinite sequences, coroutines, state machines. yield*  pentru delegare. return valoare finală.', example: 'function* counter(start = 0) {\n  while (true) {\n    const reset = yield start++;\n    if (reset) start = 0;\n  }\n}\n\nconst c = counter(10);\nc.next(); // { value: 10, done: false }\nc.next(); // { value: 11, done: false }\nc.next(true); // reset! { value: 0, done: false }\n\n// yield* delegare\nfunction* concat<T>(...iters: Iterable<T>[]) {\n  for (const iter of iters) yield* iter;\n}\nconst all = [...concat([1,2], [3,4], [5])]; // [1,2,3,4,5]', related: ['iterators_generators', 'async_generator'] },
  closure_patterns: { id: 'closure_patterns', label: 'Closure Patterns', category: 'javascript', description: 'Closure pentru module pattern, partial application, memoizare, private state. IIFE + closure = module pattern clasic.', example: 'function makeCounter(initial = 0) {\n  let count = initial;\n  return {\n    increment() { count++; },\n    decrement() { count--; },\n    get value() { return count; },\n    reset() { count = initial; },\n  };\n}\n\n// Once — apelat o singură dată\nfunction once<T extends (...args: any[]) => any>(fn: T): T {\n  let called = false;\n  let result: ReturnType<T>;\n  return ((...args: Parameters<T>) => {\n    if (!called) { called = true; result = fn(...args); }\n    return result;\n  }) as T;\n}', related: ['closure', 'currying'] },
  exception_handling: { id: 'exception_handling', label: 'Exception vs Return Error', category: 'javascript', description: 'Throws vs return error object. Result pattern (Ok/Err). NeverThrow library. Alegere: throw pentru exceptii, Result pentru erori așteptate.', example: '// Result pattern (fara throws)\ntype Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };\n\nfunction safeDivide(a: number, b: number): Result<number, string> {\n  if (b === 0) return { ok: false, error: "Division by zero" };\n  return { ok: true, value: a / b };\n}\n\nconst result = safeDivide(10, 2);\nif (result.ok) console.log(result.value); // 5\nelse console.error(result.error);', related: ['error_handling', 'error_types'] },
  ocr_mobile: { id: 'ocr_mobile', label: 'OCR în Mobile Apps', category: 'react-native', description: 'Optical Character Recognition: extrage text din imagini. expo-camera pentru captură. MLKit (react-native-mlkit) sau Tesseract pentru procesare.', example: 'import TextRecognition from "@react-native-ml-kit/text-recognition";\n\nasync function extractTextFromImage(imageUri: string): Promise<string> {\n  const result = await TextRecognition.recognize(imageUri);\n  \n  const allText = result.blocks\n    .map(block => block.text)\n    .join("\\n");\n  \n  return allText.trim();\n}\n\n// Cu camera\nconst photo = await camera.takePictureAsync({ quality: 0.8 });\nconst text = await extractTextFromImage(photo.uri);\nsetExtractedText(text);', related: ['expo_camera_api', 'ai'] },
  pin_auth: { id: 'pin_auth', label: 'PIN Authentication Pattern', category: 'react-native', description: 'PIN storage criptat cu SecureStore. Hash PIN cu bcrypt sau PBKDF2. Biometrics fallback. Lockout după încercări eșuate.', example: 'import * as SecureStore from "expo-secure-store";\nimport { createHash } from "expo-crypto";\n\nasync function setPin(pin: string): Promise<void> {\n  const salt = Math.random().toString(36).slice(2);\n  const hash = await Crypto.digestStringAsync(\n    Crypto.CryptoDigestAlgorithm.SHA256,\n    pin + salt\n  );\n  await SecureStore.setItemAsync("pin_hash", hash);\n  await SecureStore.setItemAsync("pin_salt", salt);\n}\n\nasync function verifyPin(input: string): Promise<boolean> {\n  const salt = await SecureStore.getItemAsync("pin_salt");\n  const stored = await SecureStore.getItemAsync("pin_hash");\n  if (!salt || !stored) return false;\n  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input + salt);\n  return hash === stored;\n}', related: ['secure_store', 'biometrics'] },
};

// ─── Comparații Stack ──────────────────────────────────────────────────────────

export const STACK_COMPARISONS: Record<string, { title: string; content: string }> = {
  'mobile-framework': {
    title: 'React Native vs Flutter vs Ionic',
    content: `**React Native** (Meta)
• JavaScript/TypeScript + React
• Componente native reale, nu WebView
• Ecosistem enorm, comunitate uriașă
• Expo = setup instant, EAS = build cloud
• Best for: devs JS, apps hibride

**Flutter** (Google)
• Dart language
• Pixeli proprii, aspect identic pe toate platformele
• Performanță excelentă, UI consistent
• Best for: UI complex, echipe Dart

**Ionic** (open source)
• HTML/CSS/JS cu Capacitor
• WebView = performanță mai slabă
• Best for: web devs, prototipuri rapide`,
  },
  'js-framework': {
    title: 'React vs Vue vs Angular',
    content: `**React** (Meta)
• Librărie UI + ecosistem extern
• JSX, unidirecțional, hooks
• Flexibil dar necesită mai multe decizii arhitecturale
• Cel mai popular în 2024

**Vue.js**
• Framework progresiv
• Template syntax intuitiv, two-way binding
• Documentație excelentă
• Curbă de învățare mai mică

**Angular** (Google)
• Framework complet (DI, routing, forms incluse)
• TypeScript by default
• Enterprise, structurat, opinionated
• Curbă de învățare mare`,
  },
  'backend': {
    title: 'Node.js vs Python vs Go pentru Backend',
    content: `**Node.js + Express/Fastify**
• JavaScript fullstack
• Ideal pentru I/O intensiv, real-time (WebSockets)
• NPM ecosistem enorm

**Python + FastAPI/Django**
• Sintaxă clară, productivitate mare
• FastAPI = async modern, Django = batteries included
• Ideal pentru AI/ML integration

**Go (Golang)**
• Performanță aproape de C
• Concurrency nativă (goroutines)
• Compilat, executabil mic
• Ideal pentru microservicii, APIs cu trafic mare`,
  },
  'database': {
    title: 'PostgreSQL vs MongoDB vs Redis',
    content: `**PostgreSQL**
• SQL relațional, ACID complet
• JSON support nativ (jsonb)
• Extensii: PostGIS (geo), pg_vector (AI)
• Best for: date structurate, relații complexe

**MongoDB**
• Document DB (BSON/JSON)
• Schema flexibilă
• Scalare orizontală nativă
• Best for: date nestructurate, prototipare rapidă

**Redis**
• In-memory key-value store
• Microsecunde latency
• Pub/Sub, Streams, Search
• Best for: cache, sesiuni, real-time`,
  },
};

// ─── Template-uri App ──────────────────────────────────────────────────────────

export const APP_TEMPLATES: Record<string, AppTemplate> = {
  'todo-rn': {
    id: 'todo-rn',
    name: 'Todo App React Native',
    stack: 'React Native + TypeScript + AsyncStorage',
    description: 'Aplicație simplă de todo cu persistare locală',
    dependencies: ['@react-native-async-storage/async-storage'],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('todos').then(data => {
      if (data) setTodos(JSON.parse(data));
    });
  }, []);

  const save = (next: Todo[]) => {
    setTodos(next);
    AsyncStorage.setItem('todos', JSON.stringify(next));
  };

  const add = () => {
    if (!input.trim()) return;
    save([...todos, { id: Date.now().toString(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggle = (id: string) =>
    save(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const remove = (id: string) => save(todos.filter(t => t.id !== id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Adaugă sarcină..."
          onSubmitEditing={add}
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => toggle(item.id)}>
            <Text style={[styles.itemText, item.done && styles.done]}>
              {item.done ? '✓ ' : '○ '}{item.text}
            </Text>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.del}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1A1A28', color: '#fff', borderRadius: 12, padding: 14, fontSize: 16 },
  addBtn: { backgroundColor: '#6C63FF', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  addText: { color: '#fff', fontSize: 24 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A28', borderRadius: 12, padding: 14, marginBottom: 8 },
  itemText: { color: '#fff', fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: '#555' },
  del: { color: '#FF5252', fontSize: 20 },
});`,
      },
    ],
  },
  'api-express': {
    id: 'api-express',
    name: 'REST API Express + TypeScript',
    stack: 'Node.js + Express + TypeScript + SQLite',
    description: 'Backend API REST complet cu autentificare JWT',
    dependencies: ['express', 'better-sqlite3', 'jsonwebtoken', 'bcrypt'],
    files: [
      {
        path: 'src/index.ts',
        content: `import express from 'express';
import { userRouter } from './routes/users';
import { authMiddleware } from './middleware/auth';

const app = express();
app.use(express.json());

// Routes publice
app.use('/api/auth', authRouter);

// Routes protejate
app.use('/api/users', authMiddleware, userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server pe portul \${PORT}\`));`,
      },
    ],
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page React',
    stack: 'React + Vite + TypeScript + TailwindCSS',
    description: 'Landing page modern cu hero, features, CTA',
    dependencies: ['react', 'vite', 'tailwindcss'],
    files: [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Produsul Tău
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Descriere convingătoare care explică valoarea produsului în 2 fraze.
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
          Începe Gratuit
        </button>
      </section>
      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">De ce noi?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(f => (
            <div key={f.title} className="bg-gray-900 rounded-2xl p-8">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const features = [
  { icon: '⚡', title: 'Ultra Rapid', desc: 'Performanță maximă cu tehnologia de ultimă generație.' },
  { icon: '🔒', title: 'Securizat', desc: 'Datele tale sunt protejate cu cele mai avansate metode.' },
  { icon: '💎', title: 'Premium', desc: 'Experiență de utilizare excepțională la fiecare interacțiune.' },
];`,
      },
    ],
  },
  'auth-system': {
    id: 'auth-system',
    name: 'Sistem Autentificare',
    stack: 'Node.js + JWT + bcrypt + SQLite',
    description: 'Autentificare completă: register, login, refresh token, logout',
    dependencies: ['express', 'jsonwebtoken', 'bcryptjs', 'better-sqlite3'],
    files: [
      {
        path: 'src/auth.ts',
        content: `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret-local';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret';

export async function register(email: string, password: string) {
  const hash = await bcrypt.hash(password, 12);
  // db.insert({ email, password: hash });
  return { success: true };
}

export async function login(email: string, password: string) {
  // const user = db.findByEmail(email);
  // if (!user || !await bcrypt.compare(password, user.password)) throw Error('Invalid');
  
  const accessToken = jwt.sign({ userId: 'id' }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: 'id' }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function verify(token: string) {
  return jwt.verify(token, SECRET) as { userId: string };
}`,
      },
    ],
  },
  'chat-app': {
    id: 'chat-app',
    name: 'Chat App Real-Time',
    stack: 'Node.js + Socket.io + React Native',
    description: 'Aplicație de chat cu WebSockets',
    dependencies: ['socket.io', 'socket.io-client'],
    files: [
      {
        path: 'server.ts',
        content: `import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

const rooms = new Map<string, string[]>();

io.on('connection', (socket) => {
  console.log('User conectat:', socket.id);

  socket.on('join', (room: string) => {
    socket.join(room);
    io.to(room).emit('system', \`\${socket.id} a intrat în cameră\`);
  });

  socket.on('message', ({ room, text }: { room: string; text: string }) => {
    io.to(room).emit('message', { from: socket.id, text, at: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('User deconectat:', socket.id);
  });
});

httpServer.listen(3001, () => console.log('Socket server pe portul 3001'));`,
      },
    ],
  },
  'calculator': {
    id: 'calculator',
    name: 'Calculator React Native',
    stack: 'React Native + TypeScript',
    description: 'Calculator complet cu operații matematice',
    dependencies: [],
    files: [
      {
        path: 'Calculator.tsx',
        content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState('');
  const [op, setOp] = useState('');

  const press = (btn: string) => {
    if (btn === 'C') { setDisplay('0'); setPrev(''); setOp(''); return; }
    if (btn === '=') {
      const a = parseFloat(prev), b = parseFloat(display);
      const result = op === '+' ? a+b : op === '−' ? a-b : op === '×' ? a*b : a/b;
      setDisplay(String(result)); setPrev(''); setOp(''); return;
    }
    if (['+', '−', '×', '÷'].includes(btn)) {
      setPrev(display); setOp(btn); setDisplay('0'); return;
    }
    setDisplay(d => d === '0' ? btn : d + btn);
  };

  return (
    <View style={s.container}>
      <Text style={s.display}>{display}</Text>
      {BUTTONS.map((row, i) => (
        <View key={i} style={s.row}>
          {row.map(btn => (
            <TouchableOpacity key={btn} style={[s.btn, btn==='=' && s.eq, btn==='0' && s.zero]} onPress={() => press(btn)}>
              <Text style={[s.btnText, ['+','−','×','÷','='].includes(btn) && s.opText]}>{btn}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1e', justifyContent: 'flex-end', padding: 16 },
  display: { color: '#fff', fontSize: 72, textAlign: 'right', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: { flex: 1, height: 80, backgroundColor: '#333', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  zero: { flex: 2, paddingLeft: 30, alignItems: 'flex-start' },
  eq: { backgroundColor: '#ff9f0a' },
  btnText: { color: '#fff', fontSize: 28 },
  opText: { color: '#fff' },
});`,
      },
    ],
  },
  'notes-sqlite': {
    id: 'notes-sqlite',
    name: 'Notes App cu SQLite',
    stack: 'React Native + Expo SQLite + TypeScript',
    description: 'Aplicație de notițe cu bază de date locală SQLite',
    dependencies: ['expo-sqlite'],
    files: [
      {
        path: 'src/db.ts',
        content: `import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function initDB() {
  db = await SQLite.openDatabaseAsync('notes.db');
  await db.execAsync(\`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  \`);
}

export async function getNotes() {
  return db.getAllAsync<Note>('SELECT * FROM notes ORDER BY updated_at DESC');
}

export async function saveNote(note: Omit<Note, 'created_at' | 'updated_at'>) {
  await db.runAsync(
    'INSERT OR REPLACE INTO notes (id, title, content, updated_at) VALUES (?, ?, ?, ?)',
    [note.id, note.title, note.content ?? '', Date.now()]
  );
}

export async function deleteNote(id: string) {
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
}`,
      },
    ],
  },
  'weather-app': {
    id: 'weather-app',
    name: 'Weather App',
    stack: 'React Native + OpenWeatherMap API',
    description: 'Aplicație vreme cu geolocation',
    dependencies: ['expo-location'],
    files: [
      {
        path: 'WeatherApp.tsx',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

interface Weather {
  temp: number;
  feels_like: number;
  description: string;
  city: string;
  humidity: number;
  wind: number;
}

const API_KEY = 'YOUR_OPENWEATHER_API_KEY';

export default function WeatherApp() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setError('Permisiune refuzată'); setLoading(false); return; }
      
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      
      const res = await fetch(
        \`https://api.openweathermap.org/data/2.5/weather?lat=\${latitude}&lon=\${longitude}&appid=\${API_KEY}&units=metric&lang=ro\`
      );
      const data = await res.json();
      
      setWeather({
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        city: data.name,
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6),
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <View style={s.container}><ActivityIndicator color="#6C63FF" size="large" /></View>;

  return (
    <View style={s.container}>
      <Text style={s.city}>{weather?.city}</Text>
      <Text style={s.temp}>{weather?.temp}°C</Text>
      <Text style={s.desc}>{weather?.description}</Text>
      <View style={s.details}>
        <Text style={s.detail}>💧 {weather?.humidity}%</Text>
        <Text style={s.detail}>💨 {weather?.wind} km/h</Text>
        <Text style={s.detail}>🌡️ {weather?.feels_like}°C</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A', alignItems: 'center', justifyContent: 'center' },
  city: { color: '#aaa', fontSize: 24, marginBottom: 8 },
  temp: { color: '#fff', fontSize: 96, fontWeight: 'bold' },
  desc: { color: '#6C63FF', fontSize: 20, textTransform: 'capitalize', marginBottom: 40 },
  details: { flexDirection: 'row', gap: 30 },
  detail: { color: '#888', fontSize: 16 },
});`,
      },
    ],
  },

  'quiz-app': {
    id: 'quiz-app',
    name: 'Quiz App cu Timer',
    description: 'Quiz interactiv cu timer, scor și animații. Categorie selectabilă, progres vizual.',
    category: 'mobile',
    difficulty: 'intermediate',
    steps: [
      {
        name: 'Quiz App React Native',
        description: 'Quiz cu timer și scoring',
        language: 'typescript',
        content: `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const QUESTIONS = [
  { q: 'Ce este React?', options: ['Librărie JS', 'Framework Python', 'Baza de date', 'Limbaj'], correct: 0 },
  { q: 'Ce este useState?', options: ['Hook', 'Component', 'Prop', 'Event'], correct: 0 },
  { q: 'Ce face useEffect?', options: ['Side effects', 'State', 'Render', 'Props'], correct: 0 },
];

export default function QuizApp() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 0, duration: 15000, useNativeDriver: false }).start();
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { nextQuestion(); return 15; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [current]);

  const answer = (idx: number) => {
    setSelected(idx);
    if (idx === QUESTIONS[current].correct) setScore(s => s + 1);
    setTimeout(nextQuestion, 800);
  };

  const nextQuestion = () => {
    if (current + 1 >= QUESTIONS.length) { setDone(true); return; }
    setCurrent(c => c + 1); setSelected(null); setTimeLeft(15);
    progress.setValue(1);
    Animated.timing(progress, { toValue: 0, duration: 15000, useNativeDriver: false }).start();
  };

  if (done) return (
    <View style={s.center}>
      <Text style={s.title}>🎉 Terminat!</Text>
      <Text style={s.score}>{score}/{QUESTIONS.length}</Text>
      <TouchableOpacity style={s.btn} onPress={() => { setCurrent(0); setScore(0); setDone(false); setSelected(null); setTimeLeft(15); }}>
        <Text style={s.btnText}>Joacă din nou</Text>
      </TouchableOpacity>
    </View>
  );

  const q = QUESTIONS[current];
  return (
    <View style={s.container}>
      <Text style={s.counter}>{current + 1}/{QUESTIONS.length} • ⏱ {timeLeft}s</Text>
      <Animated.View style={[s.progressBar, { width: progress.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
      <Text style={s.question}>{q.q}</Text>
      {q.options.map((opt, i) => (
        <TouchableOpacity key={i} style={[s.option, selected === i && (i === q.correct ? s.correct : s.wrong)]} onPress={() => answer(i)} disabled={selected !== null}>
          <Text style={s.optText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0A0A0F', paddingTop: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0F' },
  counter: { color: '#888', fontSize: 14, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#6C63FF', borderRadius: 2, marginBottom: 24 },
  question: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 32, lineHeight: 32 },
  option: { backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  correct: { borderColor: '#4CAF50', backgroundColor: '#1B3A1F' },
  wrong: { borderColor: '#F44336', backgroundColor: '#3A1B1B' },
  optText: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  score: { color: '#6C63FF', fontSize: 64, fontWeight: 'bold', marginBottom: 32 },
  btn: { backgroundColor: '#6C63FF', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});`,
      },
    ],
  },

  'expense-tracker': {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Tracker cheltuieli cu categorii, grafic cheltuieli lunare și SQLite pentru persistență.',
    category: 'mobile',
    difficulty: 'intermediate',
    steps: [
      {
        name: 'Expense Tracker cu SQLite',
        description: 'Gestiune financiară mobilă',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase('expenses.db');

interface Expense { id: number; amount: number; category: string; note: string; date: string; }

const CATEGORIES = ['🍕 Mâncare', '🚗 Transport', '🏠 Casă', '💊 Sănătate', '🎮 Divertisment', '📦 Altele'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL, category TEXT, note TEXT, date TEXT)');
      tx.executeSql('SELECT * FROM expenses ORDER BY date DESC', [], (_, { rows }) => setExpenses(rows._array));
    });
  }, []);

  const add = () => {
    if (!amount || isNaN(Number(amount))) return Alert.alert('Sumă invalidă');
    db.transaction(tx => {
      tx.executeSql('INSERT INTO expenses (amount, category, note, date) VALUES (?, ?, ?, ?)', [Number(amount), category, note, new Date().toISOString()],
        (_, { insertId }) => {
          const newExp = { id: insertId!, amount: Number(amount), category, note, date: new Date().toISOString() };
          setExpenses(prev => [newExp, ...prev]);
          setAmount(''); setNote('');
        });
    });
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <View style={s.container}>
      <Text style={s.total}>Total: {total.toFixed(2)} RON</Text>
      <TextInput style={s.input} placeholder="Sumă (RON)" placeholderTextColor="#666" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <TextInput style={s.input} placeholder="Notă opțională" placeholderTextColor="#666" value={note} onChangeText={setNote} />
      <View style={s.cats}>{CATEGORIES.map(c => (
        <TouchableOpacity key={c} style={[s.cat, category === c && s.catActive]} onPress={() => setCategory(c)}>
          <Text style={{ fontSize: 12, color: category === c ? '#fff' : '#aaa' }}>{c}</Text>
        </TouchableOpacity>
      ))}</View>
      <TouchableOpacity style={s.addBtn} onPress={add}><Text style={s.addText}>+ Adaugă cheltuială</Text></TouchableOpacity>
      <FlatList data={expenses} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={s.item}>
          <View><Text style={s.itemCat}>{item.category}</Text><Text style={s.itemNote}>{item.note || 'Fără notă'}</Text></View>
          <Text style={s.itemAmt}>{item.amount.toFixed(2)} RON</Text>
        </View>
      )} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16, paddingTop: 50 },
  total: { color: '#00D4FF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#1A1A2E', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  cat: { backgroundColor: '#1A1A2E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  catActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  addBtn: { backgroundColor: '#6C63FF', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A2E', padding: 14, borderRadius: 10, marginBottom: 8 },
  itemCat: { color: '#fff', fontSize: 14, fontWeight: '600' },
  itemNote: { color: '#888', fontSize: 12, marginTop: 2 },
  itemAmt: { color: '#00D4FF', fontWeight: 'bold', fontSize: 18 },
});`,
      },
    ],
  },

  'timer-stopwatch': {
    id: 'timer-stopwatch',
    name: 'Timer & Stopwatch',
    description: 'Aplicație timer/cronometru cu laps, notificări și design modern.',
    category: 'mobile',
    difficulty: 'beginner',
    steps: [
      {
        name: 'Timer Stopwatch App',
        description: 'Timer și cronometru cu laps',
        language: 'typescript',
        content: `import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function TimerApp() {
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerStart, setTimerStart] = useState(60000);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const lastLapRef = useRef(0);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => mode === 'stopwatch' ? e + 100 : Math.max(0, e - 100));
      }, 100);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const format = (ms: number) => {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return \`\${m}:\${s}.\${cs}\`;
  };

  const lap = () => { setLaps(prev => [elapsed - lastLapRef.current, ...prev]); lastLapRef.current = elapsed; };
  const reset = () => { setRunning(false); setElapsed(mode === 'timer' ? timerStart : 0); setLaps([]); lastLapRef.current = 0; };

  return (
    <View style={s.container}>
      <View style={s.tabs}>
        {(['stopwatch', 'timer'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.tab, mode === m && s.tabActive]} onPress={() => { setMode(m); reset(); }}>
            <Text style={[s.tabText, mode === m && s.tabTextActive]}>{m === 'stopwatch' ? '⏱ Cronometru' : '⏲ Timer'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.circle}>
        <Text style={s.time}>{format(elapsed)}</Text>
      </View>
      <View style={s.btns}>
        {mode === 'stopwatch' && running && (
          <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={lap}><Text style={s.btnText}>Lap</Text></TouchableOpacity>
        )}
        <TouchableOpacity style={[s.btn, running ? s.btnStop : s.btnStart]} onPress={() => setRunning(r => !r)}>
          <Text style={s.btnText}>{running ? '⏸ Pauză' : '▶ Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={reset}><Text style={s.btnText}>Reset</Text></TouchableOpacity>
      </View>
      <FlatList data={laps} keyExtractor={(_, i) => String(i)} renderItem={({ item, index }) => (
        <View style={s.lap}>
          <Text style={s.lapNum}>Lap {laps.length - index}</Text>
          <Text style={s.lapTime}>{format(item)}</Text>
        </View>
      )} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', paddingTop: 50 },
  tabs: { flexDirection: 'row', margin: 16, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#6C63FF' },
  tabText: { color: '#888' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  circle: { alignItems: 'center', justifyContent: 'center', width: 240, height: 240, borderRadius: 120, borderWidth: 4, borderColor: '#6C63FF', alignSelf: 'center', margin: 32 },
  time: { color: '#fff', fontSize: 42, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  btns: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginHorizontal: 16 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnStart: { backgroundColor: '#4CAF50' },
  btnStop: { backgroundColor: '#F44336' },
  btnSecondary: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lap: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A2E', marginHorizontal: 16 },
  lapNum: { color: '#888', fontSize: 14 },
  lapTime: { color: '#fff', fontSize: 14, fontWeight: '600' },
});`,
      },
    ],
  },

  'habit-tracker': {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Urmărire obiceiuri zilnice cu streak, calendar vizual și motivational UI.',
    category: 'mobile',
    difficulty: 'intermediate',
    steps: [
      {
        name: 'Habit Tracker App',
        description: 'Tracking obiceiuri cu streak',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Habit { id: string; name: string; completedDays: string[]; streak: number; }

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    AsyncStorage.getItem('habits').then(data => { if (data) setHabits(JSON.parse(data)); });
  }, []);

  const save = (data: Habit[]) => { setHabits(data); AsyncStorage.setItem('habits', JSON.stringify(data)); };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    save([...habits, { id: Date.now().toString(), name: newHabit.trim(), completedDays: [], streak: 0 }]);
    setNewHabit('');
  };

  const toggle = (id: string) => {
    save(habits.map(h => {
      if (h.id !== id) return h;
      const isDone = h.completedDays.includes(today);
      const completedDays = isDone ? h.completedDays.filter(d => d !== today) : [...h.completedDays, today];
      const streak = isDone ? Math.max(0, h.streak - 1) : h.streak + 1;
      return { ...h, completedDays, streak };
    }));
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const done = item.completedDays.includes(today);
    return (
      <TouchableOpacity style={[s.habit, done && s.habitDone]} onPress={() => toggle(item.id)}>
        <View style={s.habitInfo}>
          <Text style={s.habitName}>{item.name}</Text>
          <Text style={s.streak}>🔥 {item.streak} zile streak</Text>
        </View>
        <View style={[s.check, done && s.checkDone]}>
          <Text style={{ color: '#fff' }}>{done ? '✓' : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const completedToday = habits.filter(h => h.completedDays.includes(today)).length;

  return (
    <View style={s.container}>
      <Text style={s.header}>Habits 🎯</Text>
      <Text style={s.sub}>{completedToday}/{habits.length} completate azi</Text>
      <View style={s.addRow}>
        <TextInput style={s.input} placeholder="Obicei nou..." placeholderTextColor="#666" value={newHabit} onChangeText={setNewHabit} onSubmitEditing={addHabit} />
        <TouchableOpacity style={s.addBtn} onPress={addHabit}><Text style={s.addBtnText}>+</Text></TouchableOpacity>
      </View>
      <FlatList data={habits} keyExtractor={h => h.id} renderItem={renderHabit} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16, paddingTop: 50 },
  header: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  sub: { color: '#6C63FF', fontSize: 16, marginBottom: 20 },
  addRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1A1A2E', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  addBtn: { backgroundColor: '#6C63FF', width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 28, fontWeight: 'bold', lineHeight: 32 },
  habit: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A3E' },
  habitDone: { borderColor: '#4CAF50', backgroundColor: '#1B3A1F' },
  habitInfo: { flex: 1 },
  habitName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  streak: { color: '#888', fontSize: 12, marginTop: 4 },
  check: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
});`,
      },
    ],
  },

  'pomodoro': {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    description: 'Metodă Pomodoro: 25 min focus + 5 min break. Notificări, sessions tracking, dark UI.',
    category: 'mobile',
    difficulty: 'beginner',
    steps: [
      {
        name: 'Pomodoro Timer',
        description: 'Focus timer cu metodă Pomodoro',
        language: 'typescript',
        content: `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';

const WORK_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export default function Pomodoro() {
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [seconds, setSeconds] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const totalTime = mode === 'work' ? WORK_TIME : mode === 'short' ? SHORT_BREAK : LONG_BREAK;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            Vibration.vibrate([500, 500, 500]);
            if (mode === 'work') {
              const newSessions = sessions + 1;
              setSessions(newSessions);
              if (newSessions % 4 === 0) { setMode('long'); return LONG_BREAK; }
              setMode('short'); return SHORT_BREAK;
            }
            setMode('work'); return WORK_TIME;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, sessions]);

  const reset = () => { setRunning(false); setSeconds(totalTime); };
  const skip = () => { if (mode === 'work') { setSessions(s => s + 1); setMode('short'); setSeconds(SHORT_BREAK); } else { setMode('work'); setSeconds(WORK_TIME); } };

  const pct = seconds / totalTime;
  const color = mode === 'work' ? '#6C63FF' : mode === 'short' ? '#4CAF50' : '#00D4FF';
  const label = mode === 'work' ? '🎯 Focus' : mode === 'short' ? '☕ Pauză scurtă' : '🏖 Pauză lungă';

  return (
    <View style={[s.container, { backgroundColor: '#0A0A0F' }]}>
      <Text style={s.sessions}>Sesiuni: {sessions} 🍅</Text>
      <Text style={[s.modeLabel, { color }]}>{label}</Text>
      <View style={[s.circle, { borderColor: color }]}>
        <Text style={s.time}>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</Text>
        <Text style={{ color: '#888' }}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={s.btns}>
        <TouchableOpacity style={[s.btn, running ? { backgroundColor: '#F44336' } : { backgroundColor: color }]} onPress={() => setRunning(r => !r)}>
          <Text style={s.btnText}>{running ? '⏸ Pauză' : '▶ Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={reset}><Text style={s.btnText}>↺ Reset</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={skip}><Text style={s.btnText}>⏭ Skip</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sessions: { color: '#888', fontSize: 18, marginBottom: 12 },
  modeLabel: { fontSize: 22, fontWeight: 'bold', marginBottom: 40 },
  circle: { width: 260, height: 260, borderRadius: 130, borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  time: { color: '#fff', fontSize: 56, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  btns: { flexDirection: 'row', gap: 10 },
  btn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  btnSecondary: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});`,
      },
    ],
  },

  'password-generator': {
    id: 'password-generator',
    name: 'Generator de Parole',
    description: 'Generator parole securizate cu opțiuni: lungime, simboluri, cifre, litere mari. Copy to clipboard.',
    category: 'mobile',
    difficulty: 'beginner',
    steps: [
      {
        name: 'Password Generator',
        description: 'Generator parole securizate',
        language: 'typescript',
        content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Slider, Clipboard } from 'react-native';

const CHARS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generatePassword(length: number, opts: Record<string, boolean>): string {
  let pool = '';
  if (opts.lower) pool += CHARS.lower;
  if (opts.upper) pool += CHARS.upper;
  if (opts.numbers) pool += CHARS.numbers;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => pool[b % pool.length]).join('');
}

function strength(pwd: string): { label: string; color: string; score: number } {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: 'Foarte slabă', color: '#F44336' },
    { label: 'Slabă', color: '#FF9800' },
    { label: 'Medie', color: '#FFC107' },
    { label: 'Bună', color: '#8BC34A' },
    { label: 'Puternică', color: '#4CAF50' },
    { label: 'Excelentă', color: '#00BCD4' },
  ];
  return { ...map[Math.min(score, 5)], score };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, numbers: true, symbols: false });
  const [password, setPassword] = useState(() => generatePassword(16, { lower: true, upper: true, numbers: true, symbols: false }));
  const [copied, setCopied] = useState(false);

  const generate = () => setPassword(generatePassword(length, opts));
  const copy = () => { Clipboard.setString(password); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const str = strength(password);

  return (
    <View style={s.container}>
      <Text style={s.title}>🔐 Generator Parole</Text>
      <TouchableOpacity style={s.passwordBox} onPress={copy}>
        <Text style={s.password} numberOfLines={1}>{password}</Text>
        <Text style={s.copyBtn}>{copied ? '✓' : '📋'}</Text>
      </TouchableOpacity>
      <View style={s.strRow}>
        {Array.from({length: 5}, (_, i) => (
          <View key={i} style={[s.strBar, { backgroundColor: i < str.score ? str.color : '#2A2A3E' }]} />
        ))}
        <Text style={[s.strLabel, { color: str.color }]}>{str.label}</Text>
      </View>
      <Text style={s.lengthLabel}>Lungime: {length}</Text>
      {Object.entries(opts).map(([key, val]) => (
        <View key={key} style={s.optRow}>
          <Text style={s.optLabel}>{{ lower: 'a-z Minuscule', upper: 'A-Z Majuscule', numbers: '0-9 Cifre', symbols: '!@# Simboluri' }[key]}</Text>
          <Switch value={val} onValueChange={v => setOpts(o => ({ ...o, [key]: v }))} trackColor={{ true: '#6C63FF' }} />
        </View>
      ))}
      <TouchableOpacity style={s.genBtn} onPress={generate}><Text style={s.genText}>⚡ Generează</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 24, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  passwordBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, marginBottom: 12, gap: 10, borderWidth: 1, borderColor: '#333' },
  password: { flex: 1, color: '#00D4FF', fontSize: 16, fontFamily: 'monospace' },
  copyBtn: { fontSize: 22 },
  strRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  strBar: { flex: 1, height: 6, borderRadius: 3 },
  strLabel: { fontSize: 12, fontWeight: '600', minWidth: 80 },
  lengthLabel: { color: '#fff', fontSize: 16, marginBottom: 8 },
  optRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
  optLabel: { color: '#fff', fontSize: 16 },
  genBtn: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  genText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});`,
      },
    ],
  },

  'markdown-editor': {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    description: 'Editor Markdown cu preview live, highlight sintaxă și export. Stocare locală.',
    category: 'mobile',
    difficulty: 'intermediate',
    steps: [
      {
        name: 'Markdown Editor',
        description: 'Editor cu preview live',
        language: 'typescript',
        content: `import React, { useState } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SAMPLE = \`# Hello, Markdown!

## Introducere

Acesta este un **editor Markdown** cu *preview live*.

## Features

- ✅ Preview în timp real
- 📝 Editare simplă
- 💾 Salvare automată

## Cod

\\\`\\\`\\\`javascript
const msg = "Hello World!";
console.log(msg);
\\\`\\\`\\\`

> Citat inspirațional: *Codul bun este documentat de sine.*
\`;

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\\n');
  return (
    <ScrollView style={{ flex: 1 }}>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <Text key={i} style={s.h1}>{line.slice(2)}</Text>;
        if (line.startsWith('## ')) return <Text key={i} style={s.h2}>{line.slice(3)}</Text>;
        if (line.startsWith('### ')) return <Text key={i} style={s.h3}>{line.slice(4)}</Text>;
        if (line.startsWith('> ')) return <Text key={i} style={s.blockquote}>{line.slice(2)}</Text>;
        if (line.startsWith('- ')) return <Text key={i} style={s.li}>• {line.slice(2)}</Text>;
        if (line.startsWith('\\\`\\\`\\\`')) return <Text key={i} style={s.codeBlock}></Text>;
        return <Text key={i} style={s.p}>{line.replace(/\\*\\*(.*?)\\*\\*/g, '$1').replace(/\\*(.*?)\\*/g, '$1')}</Text>;
      })}
    </ScrollView>
  );
}

export default function MarkdownEditor() {
  const [text, setText] = useState(SAMPLE);
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        {(['edit', 'split', 'preview'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.tab, mode === m && s.tabActive]} onPress={() => setMode(m)}>
            <Text style={[s.tabText, mode === m && s.tabTextActive]}>{{ edit: '✏️', split: '⚡', preview: '👁' }[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1, flexDirection: mode === 'split' ? 'row' : 'column' }}>
        {mode !== 'preview' && (
          <TextInput style={[s.editor, mode === 'split' && { flex: 1, borderRightWidth: 1, borderRightColor: '#2A2A3E' }]}
            value={text} onChangeText={setText} multiline textAlignVertical="top" />
        )}
        {mode !== 'edit' && (
          <View style={[s.preview, mode === 'split' && { flex: 1 }]}>
            <MarkdownRenderer text={text} />
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', paddingTop: 50 },
  toolbar: { flexDirection: 'row', backgroundColor: '#1A1A2E', padding: 8, gap: 8 },
  tab: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#6C63FF' },
  tabText: { color: '#888', fontSize: 18 },
  tabTextActive: { color: '#fff' },
  editor: { flex: 1, color: '#ccc', padding: 16, fontFamily: 'monospace', fontSize: 14, backgroundColor: '#0D0D18' },
  preview: { flex: 1, padding: 16 },
  h1: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  h2: { color: '#00D4FF', fontSize: 22, fontWeight: 'bold', marginVertical: 6 },
  h3: { color: '#6C63FF', fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  p: { color: '#ccc', fontSize: 15, lineHeight: 24, marginVertical: 2 },
  li: { color: '#ccc', fontSize: 15, marginVertical: 2, marginLeft: 8 },
  blockquote: { color: '#888', fontStyle: 'italic', borderLeftWidth: 3, borderLeftColor: '#6C63FF', paddingLeft: 12, marginVertical: 4 },
  codeBlock: { backgroundColor: '#1A1A2E', padding: 2, height: 2, borderRadius: 4, marginVertical: 4 },
});`,
      },
    ],
  },

  'barcode-scanner': {
    id: 'barcode-scanner',
    name: 'Scanner QR / Barcode',
    description: 'Scanner QR Code și barcode cu expo-camera. Istoric scanări, copy & open URL.',
    category: 'mobile',
    difficulty: 'beginner',
    steps: [
      {
        name: 'QR Scanner App',
        description: 'Scanner QR cu istoricul scanărilor',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Linking, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface ScanResult { id: string; data: string; type: string; time: string; }

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [lastScan, setLastScan] = useState('');

  const onScan = ({ data, type }: { data: string; type: string }) => {
    if (data === lastScan) return;
    setLastScan(data);
    const result: ScanResult = { id: Date.now().toString(), data, type, time: new Date().toLocaleTimeString() };
    setHistory(prev => [result, ...prev.slice(0, 19)]);
    setScanning(false);
    Alert.alert('Scanat!', data.substring(0, 60), [
      { text: 'Închide' },
      { text: 'Deschide', onPress: () => { if (data.startsWith('http')) Linking.openURL(data); } },
    ]);
  };

  if (scanning) return (
    <CameraView style={{ flex: 1 }} onBarcodeScanned={onScan} barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}>
      <View style={s.overlay}>
        <View style={s.scanBox} />
        <Text style={s.scanText}>Aliniați codul în dreptunghiul de sus</Text>
        <TouchableOpacity style={s.cancelBtn} onPress={() => setScanning(false)}><Text style={s.cancelText}>Anulează</Text></TouchableOpacity>
      </View>
    </CameraView>
  );

  if (!permission?.granted) return (
    <View style={s.center}>
      <Text style={s.title}>Scanner QR</Text>
      <Text style={s.desc}>Permisiunea la cameră este necesară</Text>
      <TouchableOpacity style={s.btn} onPress={requestPermission}><Text style={s.btnText}>Acordă permisiune</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>📷 Scanner QR</Text>
      <TouchableOpacity style={s.scanBtn} onPress={() => { setLastScan(''); setScanning(true); }}>
        <Text style={s.scanBtnText}>Scanează cod</Text>
      </TouchableOpacity>
      <Text style={s.histTitle}>Istoric ({history.length})</Text>
      <FlatList data={history} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={s.item} onPress={() => { if (item.data.startsWith('http')) Linking.openURL(item.data); }}>
          <Text style={s.itemType}>{item.type}</Text>
          <Text style={s.itemData} numberOfLines={1}>{item.data}</Text>
          <Text style={s.itemTime}>{item.time}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16, paddingTop: 50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0F', padding: 32 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanBox: { width: 250, height: 250, borderWidth: 3, borderColor: '#6C63FF', borderRadius: 12 },
  scanText: { color: '#fff', marginTop: 20, fontSize: 14 },
  cancelBtn: { marginTop: 32, backgroundColor: '#333', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  cancelText: { color: '#fff', fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  desc: { color: '#888', textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scanBtn: { backgroundColor: '#6C63FF', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  histTitle: { color: '#888', fontSize: 14, marginBottom: 12 },
  item: { backgroundColor: '#1A1A2E', padding: 14, borderRadius: 10, marginBottom: 8 },
  itemType: { color: '#6C63FF', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  itemData: { color: '#fff', fontSize: 14 },
  itemTime: { color: '#555', fontSize: 11, marginTop: 4 },
});`,
      },
    ],
  },

  'flashcard-app': {
    id: 'flashcard-app',
    name: 'Flashcard App',
    description: 'Aplicație flashcards pentru învățare. Flip animat, deck-uri multiple, progres tracking.',
    category: 'mobile',
    difficulty: 'intermediate',
    steps: [
      {
        name: 'Flashcard App',
        description: 'Flashcards cu animație flip și scoring',
        language: 'typescript',
        content: `import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface Card { front: string; back: string; }

const DECK: Card[] = [
  { front: 'Ce este closure în JS?', back: 'O funcție care reține accesul la variabilele din scope-ul exterior, chiar și după ce scope-ul a dispărut.' },
  { front: 'Ce face useCallback?', back: 'Memoizează o funcție callback, evitând recrearea ei la fiecare render. Util ca prop la componente optimizate cu memo().' },
  { front: 'Ce este Promise.all?', back: 'Execută mai multe Promises în paralel și returnează un array cu rezultatele. Dacă oricare eșuează, Promise.all eșuează.' },
  { front: 'Diferența map() vs forEach()?', back: 'map() returnează un array nou transformat. forEach() nu returnează nimic — doar iterează pentru side effects.' },
  { front: 'Ce este TypeScript Generics?', back: 'Tipuri parametrizate care permit scrierea de cod refolosibil cu type-safety. Exemplu: Array<T>, Promise<T>.' },
];

export default function FlashcardApp() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.spring(flipAnim, { toValue: flipped ? 0 : 1, friction: 8, useNativeDriver: true }).start();
    setFlipped(f => !f);
  };

  const next = (wasKnown: boolean) => {
    if (wasKnown) setKnown(k => k + 1); else setUnknown(u => u + 1);
    setFlipped(false);
    flipAnim.setValue(0);
    setCurrent(c => (c + 1) % DECK.length);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const card = DECK[current];

  return (
    <View style={s.container}>
      <Text style={s.progress}>{current + 1}/{DECK.length} • ✅{known} ❌{unknown}</Text>
      <TouchableOpacity onPress={flip} activeOpacity={0.9}>
        <View style={s.cardContainer}>
          <Animated.View style={[s.card, s.front, { transform: [{ rotateY: frontRotate }] }]}>
            <Text style={s.label}>ÎNTREBARE</Text>
            <Text style={s.cardText}>{card.front}</Text>
            <Text style={s.tapHint}>Atinge pentru răspuns</Text>
          </Animated.View>
          <Animated.View style={[s.card, s.back, { transform: [{ rotateY: backRotate }] }]}>
            <Text style={s.label}>RĂSPUNS</Text>
            <Text style={s.cardTextBack}>{card.back}</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
      {flipped && (
        <View style={s.btns}>
          <TouchableOpacity style={[s.btn, s.btnNo]} onPress={() => next(false)}><Text style={s.btnText}>❌ Nu știam</Text></TouchableOpacity>
          <TouchableOpacity style={[s.btn, s.btnYes]} onPress={() => next(true)}><Text style={s.btnText}>✅ Știam</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', paddingTop: 60 },
  progress: { color: '#888', fontSize: 14, marginBottom: 32 },
  cardContainer: { width: 320, height: 220 },
  card: { width: 320, height: 220, position: 'absolute', borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 24, backfaceVisibility: 'hidden' },
  front: { backgroundColor: '#1A1A2E', borderWidth: 2, borderColor: '#6C63FF' },
  back: { backgroundColor: '#1B3A2E', borderWidth: 2, borderColor: '#4CAF50' },
  label: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 12 },
  cardText: { color: '#fff', fontSize: 18, textAlign: 'center', lineHeight: 26 },
  cardTextBack: { color: '#ccc', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  tapHint: { color: '#555', fontSize: 12, marginTop: 16 },
  btns: { flexDirection: 'row', gap: 16, marginTop: 40 },
  btn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center', maxWidth: 150 },
  btnNo: { backgroundColor: '#3A1B1B', borderWidth: 2, borderColor: '#F44336' },
  btnYes: { backgroundColor: '#1B3A1F', borderWidth: 2, borderColor: '#4CAF50' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});`,
      },
    ],
  },

  'recipe-api': {
    id: 'recipe-api',
    name: 'Recipe App cu API',
    description: 'Aplicație rețete cu fetch din API public, search, favorite și detalii ingredient.',
    category: 'mobile',
    difficulty: 'intermediate',
    steps: [
      {
        name: 'Recipe App',
        description: 'Rețete cu fetch API și favorite',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';

interface Meal { idMeal: string; strMeal: string; strMealThumb: string; strCategory: string; }

export default function RecipeApp() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const search = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(\`https://www.themealdb.com/api/json/v1/1/search.php?s=\${encodeURIComponent(q)}\`);
      const data = await res.json();
      setMeals(data.meals ?? []);
    } catch (e) { setMeals([]); }
    setLoading(false);
  };

  useEffect(() => { search('chicken'); }, []);

  const toggleFav = (id: string) => setFavorites(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <View style={s.container}>
      <Text style={s.title}>🍳 Rețete</Text>
      <View style={s.searchRow}>
        <TextInput style={s.input} placeholder="Caută rețetă..." placeholderTextColor="#666" value={query} onChangeText={setQuery} onSubmitEditing={() => search(query)} returnKeyType="search" />
        <TouchableOpacity style={s.searchBtn} onPress={() => search(query)}><Text style={{ color: '#fff', fontSize: 18 }}>🔍</Text></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} /> : (
        <FlatList data={meals} keyExtractor={m => m.idMeal} numColumns={2} columnWrapperStyle={{ gap: 12 }} renderItem={({ item }) => (
          <TouchableOpacity style={s.card}>
            <Image source={{ uri: item.strMealThumb }} style={s.img} />
            <TouchableOpacity style={s.favBtn} onPress={() => toggleFav(item.idMeal)}>
              <Text style={{ fontSize: 20 }}>{favorites.has(item.idMeal) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <View style={s.cardInfo}>
              <Text style={s.mealName} numberOfLines={2}>{item.strMeal}</Text>
              <Text style={s.category}>{item.strCategory}</Text>
            </View>
          </TouchableOpacity>
        )} />
      )}
      {!loading && meals.length === 0 && <Text style={s.empty}>Nicio rețetă găsită</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16, paddingTop: 50 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#1A1A2E', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  searchBtn: { backgroundColor: '#6C63FF', width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  card: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  img: { width: '100%', height: 130 },
  favBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 4 },
  cardInfo: { padding: 10 },
  mealName: { color: '#fff', fontWeight: '600', fontSize: 13, lineHeight: 18 },
  category: { color: '#6C63FF', fontSize: 11, marginTop: 4 },
  empty: { color: '#888', textAlign: 'center', marginTop: 60, fontSize: 16 },
});`,
      },
    ],
  },

  'location-tracker': {
    id: 'location-tracker',
    name: 'Location Tracker',
    description: 'Urmărire locație GPS în timp real. Map view, coordonate, distanță parcursă, export GPX.',
    category: 'mobile',
    difficulty: 'advanced',
    steps: [
      {
        name: 'Location Tracker',
        description: 'GPS tracking cu locație în timp real',
        language: 'typescript',
        content: `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';

interface LocationPoint { lat: number; lon: number; timestamp: number; speed: number | null; altitude: number | null; }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180;
  const df = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(df/2)**2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function LocationTracker() {
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [current, setCurrent] = useState<LocationPoint | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    setTracking(true);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 5 },
      ({ coords, timestamp }) => {
        const p: LocationPoint = { lat: coords.latitude, lon: coords.longitude, timestamp, speed: coords.speed, altitude: coords.altitude };
        setCurrent(p);
        setPoints(prev => [...prev, p]);
      }
    );
  };

  const stop = () => { watchRef.current?.remove(); clearInterval(timerRef.current); setTracking(false); };
  const reset = () => { stop(); setPoints([]); setCurrent(null); setElapsed(0); };

  const totalDist = points.length > 1
    ? points.slice(1).reduce((sum, p, i) => sum + haversine(points[i].lat, points[i].lon, p.lat, p.lon), 0)
    : 0;

  const format = (s: number) => \`\${String(Math.floor(s/3600)).padStart(2,'0')}:\${String(Math.floor(s%3600/60)).padStart(2,'0')}:\${String(s%60).padStart(2,'0')}\`;

  return (
    <View style={s.container}>
      <Text style={s.title}>📍 GPS Tracker</Text>
      <View style={s.stats}>
        {[
          { label: 'Timp', value: format(elapsed) },
          { label: 'Distanță', value: totalDist >= 1000 ? \`\${(totalDist/1000).toFixed(2)} km\` : \`\${Math.round(totalDist)} m\` },
          { label: 'Puncte', value: String(points.length) },
          { label: 'Viteză', value: current?.speed != null ? \`\${(current.speed * 3.6).toFixed(1)} km/h\` : '—' },
        ].map(({ label, value }) => (
          <View key={label} style={s.stat}><Text style={s.statVal}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>
        ))}
      </View>
      {current && (
        <View style={s.coords}>
          <Text style={s.coordText}>Lat: {current.lat.toFixed(6)}</Text>
          <Text style={s.coordText}>Lon: {current.lon.toFixed(6)}</Text>
          {current.altitude != null && <Text style={s.coordText}>Alt: {Math.round(current.altitude)}m</Text>}
        </View>
      )}
      <View style={s.btns}>
        {!tracking ? (
          <TouchableOpacity style={[s.btn, { backgroundColor: '#4CAF50' }]} onPress={start}><Text style={s.btnText}>▶ Start tracking</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.btn, { backgroundColor: '#F44336' }]} onPress={stop}><Text style={s.btnText}>⏹ Stop</Text></TouchableOpacity>
        )}
        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={reset}><Text style={s.btnText}>↺ Reset</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 24, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  stat: { flex: 1, minWidth: '45%', backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, alignItems: 'center' },
  statVal: { color: '#00D4FF', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  coords: { backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, marginBottom: 24, gap: 6 },
  coordText: { color: '#888', fontFamily: 'monospace', fontSize: 13 },
  btns: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});`,
      },
    ],
  },
  'screen-capture': {
    id: 'screen-capture',
    name: 'Screen Capture App',
    stack: 'React Native + expo-media-library + TypeScript',
    description: 'Aplicație pentru capturarea ecranului și salvarea în galerie',
    dependencies: ['expo-media-library', 'expo-file-system'],
    files: [
      {
        path: 'ScreenCapture.tsx',
        content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';

export default function ScreenCapture() {
  const viewRef = useRef<View>(null);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [permGranted, setPermGranted] = useState(false);

  const requestPerms = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermGranted(status === 'granted');
    if (status !== 'granted') Alert.alert('Permisiune necesară', 'Acordă acces la galerie.');
  };

  const capture = async () => {
    if (!permGranted) { await requestPerms(); return; }
    try {
      const uri = await captureRef(viewRef, { format: 'png', quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      setLastCapture(uri);
      Alert.alert('Succes', 'Screenshot salvat în galerie!');
    } catch (e) {
      Alert.alert('Eroare', 'Nu s-a putut captura ecranul.');
    }
  };

  return (
    <View style={s.container}>
      <View ref={viewRef} style={s.preview} collapsable={false}>
        <Text style={s.previewText}>Conținut de capturat</Text>
        {lastCapture && <Image source={{ uri: lastCapture }} style={s.thumb} />}
      </View>
      <TouchableOpacity style={s.btn} onPress={capture}>
        <Text style={s.btnText}>📸 Capturează Ecran</Text>
      </TouchableOpacity>
      {!permGranted && (
        <TouchableOpacity style={[s.btn, s.permBtn]} onPress={requestPerms}>
          <Text style={s.btnText}>🔑 Acordă Permisiune</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 24, paddingTop: 60 },
  preview: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  previewText: { color: '#fff', fontSize: 18 },
  thumb: { width: 120, height: 80, borderRadius: 8, marginTop: 12 },
  btn: { backgroundColor: '#6C63FF', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  permBtn: { backgroundColor: '#FF6584' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});`,
      },
    ],
  },
  'qr-scanner': {
    id: 'qr-scanner',
    name: 'QR & Barcode Scanner',
    stack: 'React Native + expo-camera + TypeScript',
    description: 'Scanner QR și coduri de bare cu expo-camera',
    dependencies: ['expo-camera', 'expo-barcode-scanner'],
    files: [
      {
        path: 'QRScanner.tsx',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleScan = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setResult(data);
    if (data.startsWith('http')) {
      Alert.alert('Link detectat', data, [
        { text: 'Deschide', onPress: () => Linking.openURL(data) },
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  };

  if (hasPermission === null) return <View style={s.container}><Text style={s.txt}>Se solicită permisiune...</Text></View>;
  if (!hasPermission) return <View style={s.container}><Text style={s.txt}>Camera inaccesibilă. Acordă permisiune din Setări.</Text></View>;

  return (
    <View style={s.container}>
      <Text style={s.title}>📷 Scanner QR</Text>
      <View style={s.scanArea}>
        <CameraView style={s.camera} onBarcodeScanned={handleScan} barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}>
          <View style={s.overlay} />
        </CameraView>
      </View>
      {result ? (
        <View style={s.resultBox}>
          <Text style={s.resultLabel}>Rezultat:</Text>
          <Text style={s.resultText}>{result}</Text>
          <TouchableOpacity style={s.btn} onPress={() => { setScanned(false); setResult(''); }}>
            <Text style={s.btnText}>Scanează din nou</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={s.hint}>Îndreptă camera spre un cod QR sau de bare</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 24, paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  scanArea: { height: 300, borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  camera: { flex: 1 },
  overlay: { position: 'absolute', inset: 0, borderWidth: 2, borderColor: '#6C63FF', borderRadius: 16 },
  resultBox: { backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12 },
  resultLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  resultText: { color: '#00D4FF', fontSize: 16, marginBottom: 12 },
  btn: { backgroundColor: '#6C63FF', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  hint: { color: '#888', textAlign: 'center', marginTop: 12 },
  txt: { color: '#fff', textAlign: 'center', marginTop: 100 },
});`,
      },
    ],
  },
  'timer-app': {
    id: 'timer-app',
    name: 'Timer & Cronometru',
    stack: 'React Native + TypeScript',
    description: 'Timer, cronometru și alarme cu animații',
    dependencies: [],
    files: [
      {
        path: 'TimerApp.tsx',
        content: `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';

export default function TimerApp() {
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsed(e => e + 1);
        } else {
          setRemaining(r => {
            if (r <= 1) { setRunning(false); Vibration.vibrate([500, 200, 500]); return 0; }
            return r - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const fmt = (s: number) => \`\${String(Math.floor(s / 60)).padStart(2, '0')}:\${String(s % 60).padStart(2, '0')}\`;
  const reset = () => { setRunning(false); setElapsed(0); setRemaining(timerSec); };

  return (
    <View style={s.container}>
      <View style={s.tabs}>
        {(['stopwatch', 'timer'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.tab, mode === m && s.activeTab]} onPress={() => { setMode(m); reset(); }}>
            <Text style={[s.tabText, mode === m && s.activeTabText]}>{m === 'stopwatch' ? '⏱ Cronometru' : '⏰ Timer'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.display}>{mode === 'stopwatch' ? fmt(elapsed) : fmt(remaining)}</Text>
      <View style={s.btns}>
        <TouchableOpacity style={[s.btn, running ? s.stop : s.start]} onPress={() => setRunning(r => !r)}>
          <Text style={s.btnText}>{running ? '⏸ Pauză' : '▶ Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.reset]} onPress={reset}>
          <Text style={s.btnText}>↺ Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center', padding: 24 },
  tabs: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 4, marginBottom: 48 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  activeTab: { backgroundColor: '#6C63FF' },
  tabText: { color: '#888', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  display: { fontSize: 80, fontWeight: '200', color: '#fff', fontVariant: ['tabular-nums'], marginBottom: 48 },
  btns: { flexDirection: 'row', gap: 16 },
  btn: { flex: 1, padding: 18, borderRadius: 14, alignItems: 'center' },
  start: { backgroundColor: '#6C63FF' },
  stop: { backgroundColor: '#FF6584' },
  reset: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});`,
      },
    ],
  },
  'fitness-app': {
    id: 'fitness-app',
    name: 'Fitness Tracker',
    stack: 'React Native + TypeScript + AsyncStorage',
    description: 'Tracker antrenamente cu exerciții, seturi, repetări și calorii',
    dependencies: ['@react-native-async-storage/async-storage'],
    files: [
      {
        path: 'FitnessTracker.tsx',
        content: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Set { reps: number; weight: number; }
interface Exercise { name: string; sets: Set[]; }
interface Workout { date: string; exercises: Exercise[]; calories: number; }

export default function FitnessTracker() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [newEx, setNewEx] = useState('');
  const [today, setToday] = useState<Exercise[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('workouts').then(d => { if (d) setWorkouts(JSON.parse(d)); });
  }, []);

  const addExercise = () => {
    if (!newEx.trim()) return;
    setToday(prev => [...prev, { name: newEx.trim(), sets: [{ reps: 10, weight: 20 }] }]);
    setNewEx('');
  };

  const saveWorkout = async () => {
    const w: Workout = { date: new Date().toLocaleDateString('ro-RO'), exercises: today, calories: today.length * 50 };
    const updated = [w, ...workouts].slice(0, 30);
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
    setToday([]);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>💪 Fitness Tracker</Text>
      <View style={s.addRow}>
        <TextInput style={s.input} value={newEx} onChangeText={setNewEx} placeholder="Exercițiu (ex: Flotări)" placeholderTextColor="#555" />
        <TouchableOpacity style={s.addBtn} onPress={addExercise}><Text style={s.addBtnText}>+</Text></TouchableOpacity>
      </View>
      {today.map((ex, i) => (
        <View key={i} style={s.exCard}>
          <Text style={s.exName}>{ex.name}</Text>
          {ex.sets.map((set, j) => (
            <Text key={j} style={s.setRow}>Set {j+1}: {set.reps} rep × {set.weight}kg</Text>
          ))}
        </View>
      ))}
      {today.length > 0 && (
        <TouchableOpacity style={s.saveBtn} onPress={saveWorkout}><Text style={s.saveBtnText}>💾 Salvează Antrenamentul</Text></TouchableOpacity>
      )}
      <Text style={s.histTitle}>Istoric ({workouts.length} antrenamente)</Text>
      {workouts.map((w, i) => (
        <View key={i} style={s.histCard}>
          <Text style={s.histDate}>{w.date} — {w.calories} kcal</Text>
          <Text style={s.histExs}>{w.exercises.map(e => e.name).join(', ')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 24, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  addRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#1A1A2E', color: '#fff', padding: 14, borderRadius: 12, fontSize: 16 },
  addBtn: { backgroundColor: '#6C63FF', width: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  exCard: { backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, marginBottom: 12 },
  exName: { color: '#00D4FF', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  setRow: { color: '#888', fontSize: 14 },
  saveBtn: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  histTitle: { color: '#888', fontSize: 14, marginBottom: 12 },
  histCard: { backgroundColor: '#111', padding: 14, borderRadius: 10, marginBottom: 10 },
  histDate: { color: '#6C63FF', fontSize: 13, fontWeight: 'bold' },
  histExs: { color: '#666', fontSize: 12, marginTop: 2 },
});`,
      },
    ],
  },
};

// ─── Detectare tip de app din descriere ──────────────────────────────────────

export function detectAppType(text: string): string {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('todo') || t.includes('task') || t.includes('sarcin')) return 'todo-rn';
  if (t.includes('calculator') || t.includes('calcul')) return 'calculator';
  if (t.includes('chat') || t.includes('mesaj') || t.includes('conversatie')) return 'chat-app';
  if (t.includes('note') || t.includes('notite') || t.includes('jurnal')) return 'notes-sqlite';
  if (t.includes('vreme') || t.includes('weather') || t.includes('meteo')) return 'weather-app';
  if (t.includes('auth') || t.includes('login') || t.includes('autentificare') || t.includes('register')) return 'auth-system';
  if (t.includes('api') || t.includes('backend') || t.includes('server') || t.includes('express')) return 'api-express';
  if (t.includes('landing') || t.includes('website') || t.includes('pagina')) return 'landing-page';
  if (t.includes('captur') || t.includes('screenshot') || t.includes('screen capture') || t.includes('ecran')) return 'screen-capture';
  if (t.includes('qr') || t.includes('barcode') || t.includes('scanner') || t.includes('scan')) return 'qr-scanner';
  if (t.includes('camera') || t.includes('foto') || t.includes('poza') || t.includes('galerie')) return 'camera-app';
  if (t.includes('muzica') || t.includes('audio') || t.includes('player') || t.includes('playlist')) return 'music-player';
  if (t.includes('quiz') || t.includes('test') || t.includes('intrebari') || t.includes('chestionar')) return 'quiz-app';
  if (t.includes('timer') || t.includes('cronometru') || t.includes('stopwatch') || t.includes('alarma')) return 'timer-app';
  if (t.includes('map') || t.includes('harta') || t.includes('locatie') || t.includes('gps')) return 'map-app';
  if (t.includes('shop') || t.includes('magazin') || t.includes('cos') || t.includes('produs') || t.includes('ecomm')) return 'shop-app';
  if (t.includes('fitness') || t.includes('antrenament') || t.includes('exercitiu') || t.includes('calorii')) return 'fitness-app';
  if (t.includes('dashboard') || t.includes('grafic') || t.includes('statistic') || t.includes('chart')) return 'dashboard-app';
  return '';
}

// ─── Căutare concept în baza de cunoștințe ────────────────────────────────────

export function findDevConcept(text: string): DevConcept | null {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = t.split(/\s+/).filter(w => w.length > 3);

  const scores: [string, number][] = [];
  for (const [id, concept] of Object.entries(DEV_CONCEPTS)) {
    let score = 0;
    const label = concept.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (t.includes(id.replace(/_/g, ' '))) score += 6;
    if (t.includes(label.toLowerCase())) score += 5;
    for (const w of words) {
      if (id.includes(w) || label.includes(w)) score += 2;
      if (concept.category.includes(w)) score += 1;
    }
    if (score > 0) scores.push([id, score]);
  }

  if (!scores.length) return null;
  scores.sort((a, b) => b[1] - a[1]);
  return DEV_CONCEPTS[scores[0][0]] || null;
}

export function findStackComparison(text: string): { title: string; content: string } | null {
  const t = text.toLowerCase();
  if (t.includes('react native') && (t.includes('flutter') || t.includes('ionic'))) return STACK_COMPARISONS['mobile-framework'];
  if ((t.includes('react') || t.includes('vue') || t.includes('angular')) && t.includes('vs')) return STACK_COMPARISONS['js-framework'];
  if ((t.includes('sql') && t.includes('nosql')) || t.includes('mongodb') || t.includes('postgres')) return STACK_COMPARISONS['database'];
  if (t.includes('graphql') && t.includes('rest')) return STACK_COMPARISONS['rest_vs_graphql'];
  if ((t.includes('node') || t.includes('python') || t.includes('golang') || t.includes('go')) && t.includes('backend')) return STACK_COMPARISONS['backend'];
  return null;
}
