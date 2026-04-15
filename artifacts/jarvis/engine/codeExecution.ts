
// ─── Jarvis Code Execution Engine ─────────────────────────────────────────────
// Powered by Piston API (emkc.org) — gratuit, fără auth, 40+ limbaje

export interface Language {
  id: string;
  name: string;
  version: string;
  icon: string;
  ext: string;
  example: string;
  pistonLang?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  error?: string;
}

export const LANGUAGES: Language[] = [
  {
    id: 'python',
    name: 'Python',
    version: '3.10.0',
    icon: '🐍',
    ext: '.py',
    example: `# Python — salut lume
def salut(nume: str) -> str:
    return f"Salut, {nume}! 👋"

# Fibonacci cu generatoare
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(salut("Jarvis"))
gen = fibonacci()
print("Fibonacci:", [next(gen) for _ in range(8)])

# List comprehension + lambda
numere = list(range(1, 11))
pare = [x for x in numere if x % 2 == 0]
print("Numere pare:", pare)`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: '18.15.0',
    pistonLang: 'javascript',
    icon: '🟨',
    ext: '.js',
    example: `// JavaScript (Node.js) — salut lume
const salut = (name) => \`Salut, \${name}! 👋\`;

// Async/await + fetch simulation
async function calculeaza(n) {
  return new Promise(resolve => {
    const result = Array.from({length: n}, (_, i) => i + 1)
      .reduce((acc, val) => acc + val, 0);
    resolve(result);
  });
}

// Destructuring + spread
const [primul, ...rest] = [1, 2, 3, 4, 5];
const obiect = { x: 1, y: 2, ...{z: 3} };

console.log(salut("Jarvis"));
calculeaza(100).then(sum => console.log(\`Suma 1-100: \${sum}\`));
console.log("Rest:", rest);
console.log("Obiect:", JSON.stringify(obiect));`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    version: '5.0.3',
    icon: '🔷',
    ext: '.ts',
    example: `// TypeScript — tipuri puternice
interface Utilizator {
  id: number;
  nume: string;
  email: string;
  rol: 'admin' | 'user' | 'guest';
}

function creeazaUtilizator(
  id: number,
  nume: string,
  email: string
): Utilizator {
  return { id, nume, email, rol: 'user' };
}

// Generic function
function primulElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Class cu generics
class Stiva<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  size(): number { return this.items.length; }
}

const user = creeazaUtilizator(1, "Jarvis", "jarvis@ai.ro");
console.log("Utilizator:", user);
const stiva = new Stiva<number>();
[1, 2, 3].forEach(n => stiva.push(n));
console.log("Pop:", stiva.pop(), "| Mărime:", stiva.size());`,
  },
  {
    id: 'java',
    name: 'Java',
    version: '15.0.2',
    icon: '☕',
    ext: '.java',
    example: `// Java — OOP clasic
import java.util.*;
import java.util.stream.*;

public class Main {
    record Produs(String nume, double pret) {}

    public static void main(String[] args) {
        List<Produs> produse = List.of(
            new Produs("Laptop", 2500.0),
            new Produs("Mouse", 75.0),
            new Produs("Tastatura", 180.0)
        );

        // Streams + Lambda
        double total = produse.stream()
            .mapToDouble(Produs::pret)
            .sum();

        produse.stream()
            .filter(p -> p.pret() > 100)
            .sorted(Comparator.comparingDouble(Produs::pret))
            .forEach(p -> System.out.printf("%s: %.2f RON%n",
                p.nume(), p.pret()));

        System.out.printf("Total: %.2f RON%n", total);
    }
}`,
  },
  {
    id: 'cpp',
    name: 'C++',
    pistonLang: 'c++',
    version: '10.2.0',
    icon: '⚙️',
    ext: '.cpp',
    example: `// C++ modern (C++17)
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>

template<typename T>
T suma(const std::vector<T>& v) {
    return std::accumulate(v.begin(), v.end(), T{});
}

int main() {
    std::vector<int> numere {5, 3, 8, 1, 9, 2, 7, 4, 6};
    
    // Sort + print
    std::sort(numere.begin(), numere.end());
    std::cout << "Sortat: ";
    for (auto n : numere) std::cout << n << " ";
    std::cout << "\\nSuma: " << suma(numere) << std::endl;
    
    // Lambda + transform
    std::vector<int> patrate(numere.size());
    std::transform(numere.begin(), numere.end(),
                   patrate.begin(), [](int x){ return x*x; });
    std::cout << "Pătrate: ";
    for (auto n : patrate) std::cout << n << " ";
    std::cout << std::endl;
    
    return 0;
}`,
  },
  {
    id: 'go',
    name: 'Go',
    version: '1.16.2',
    icon: '🐹',
    ext: '.go',
    example: `// Go — concurent și rapid
package main

import (
    "fmt"
    "sync"
)

func fibonacci(n int) []int {
    result := make([]int, n)
    a, b := 0, 1
    for i := 0; i < n; i++ {
        result[i] = a
        a, b = b, a+b
    }
    return result
}

func proceseazaParalel(numere []int, wg *sync.WaitGroup) {
    defer wg.Done()
    suma := 0
    for _, n := range numere {
        suma += n
    }
    fmt.Printf("Goroutine: suma = %d\\n", suma)
}

func main() {
    fib := fibonacci(10)
    fmt.Println("Fibonacci:", fib)
    
    var wg sync.WaitGroup
    grupe := [][]int{{1, 2, 3, 4, 5}, {6, 7, 8, 9, 10}}
    for _, grup := range grupe {
        wg.Add(1)
        go proceseazaParalel(grup, &wg)
    }
    wg.Wait()
    fmt.Println("Gata!")
}`,
  },
  {
    id: 'rust',
    name: 'Rust',
    version: '1.50.0',
    icon: '🦀',
    ext: '.rs',
    example: `// Rust — siguranță și performanță
use std::collections::HashMap;

fn factorial(n: u64) -> u64 {
    match n {
        0 | 1 => 1,
        _ => n * factorial(n - 1),
    }
}

#[derive(Debug)]
struct Student {
    nume: String,
    nota: f64,
}

fn main() {
    // Factorial
    for i in 0..=10u64 {
        println!("{i}! = {}", factorial(i));
    }
    
    // HashMap
    let mut note: HashMap<String, f64> = HashMap::new();
    let studenti = vec![
        Student { nume: "Ana".into(), nota: 9.5 },
        Student { nume: "Ion".into(), nota: 8.0 },
    ];
    
    for s in &studenti {
        note.insert(s.nume.clone(), s.nota);
    }
    
    let medie: f64 = note.values().sum::<f64>() / note.len() as f64;
    println!("Medie: {medie:.2}");
}`,
  },
  {
    id: 'php',
    name: 'PHP',
    version: '8.2.3',
    icon: '🐘',
    ext: '.php',
    example: `<?php
// PHP 8+ cu features moderne

// Named arguments + match expression
function calculeazaDiscount(float $pret, string $tip): float {
    return $pret - match($tip) {
        'vip'     => $pret * 0.3,
        'regular' => $pret * 0.1,
        'nou'     => $pret * 0.05,
        default   => 0
    };
}

// Enum (PHP 8.1+)
// Arrow functions + array functions
$produse = [
    ['name' => 'Laptop', 'pret' => 2500],
    ['name' => 'Mouse', 'pret' => 75],
    ['name' => 'Monitor', 'pret' => 1200],
];

$scumpe = array_filter($produse, fn($p) => $p['pret'] > 100);
$total = array_reduce($produse, fn($carry, $p) => $carry + $p['pret'], 0);

foreach ($scumpe as $produs) {
    $discountat = calculeazaDiscount($produs['pret'], 'regular');
    echo "{$produs['name']}: {$discountat} RON\\n";
}
echo "Total: {$total} RON\\n";`,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    version: '3.0.1',
    icon: '💎',
    ext: '.rb',
    example: `# Ruby — elegant și expresiv
class Animal
  attr_reader :nume, :specie
  
  def initialize(nume, specie)
    @nume = nume
    @specie = specie
  end
  
  def prezinta
    "#{@specie} #{@nume}"
  end
end

class Caine < Animal
  def initialize(nume)
    super(nume, "Câine")
  end
  
  def latra = "#{@nume}: Ham ham! 🐕"
end

# Blocks + Enumerables
numere = (1..10).to_a
pare = numere.select(&:even?)
suma = numere.reduce(:+)
patrate = numere.map { |n| n ** 2 }

animals = [Caine.new("Rex"), Caine.new("Max")]
animals.each { |a| puts a.latra }

puts "Pare: #{pare}"
puts "Suma: #{suma}"
puts "Pătrate: #{patrate}"`,
  },
  {
    id: 'bash',
    name: 'Bash',
    version: '5.2.0',
    icon: '🖥',
    ext: '.sh',
    example: `#!/bin/bash
# Bash — scripting puternic

# Functii si variabile
salut() {
    local nume="$1"
    echo "Salut, $nume!"
}

# Array si manipulare
fructe=("mere" "pere" "prune" "cirese")
echo "Fructe: \${fructe[*]}"
echo "Nr. fructe: \${#fructe[@]}"

# Loop si conditii
for i in {1..5}; do
    if [ $((i % 2)) -eq 0 ]; then
        echo "$i este par"
    else
        echo "$i este impar"
    fi
done

# String manipulation
text="Jarvis AI Assistant"
echo "Lungime: \${#text}"
echo "Inlocuire: \${text/AI/Inteligent}"

salut "Utilizator"`,
  },
  {
    id: 'html',
    name: 'HTML/CSS',
    version: '5',
    icon: '🌐',
    ext: '.html',
    pistonLang: 'html',
    example: `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Jarvis Demo</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #0A0A0F, #1a1a2e);
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      min-height: 100vh;
    }
    .card {
      background: rgba(108, 99, 255, 0.1);
      border: 1px solid #6C63FF;
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      text-align: center;
    }
    button {
      background: #6C63FF;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
    }
    button:hover { background: #5a52d5; }
    #output { margin-top: 1rem; color: #00D4FF; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🤖 Jarvis</h1>
    <p>Asistent AI personal</p>
    <button onclick="document.getElementById('output').textContent='Salut! ' + new Date().toLocaleTimeString('ro')">
      Click pentru salut
    </button>
    <div id="output"></div>
  </div>
</body>
</html>`,
  },
];

// Limbaje care nu pot rula pe Piston (necesită WebView)
const WEB_ONLY_LANGS = new Set(['html']);

// Patternuri periculoase — avertizare utilizator (codul rulează în sandbox Piston, deci e sigur)
const DANGER_PATTERNS = [
  /import\s+os/,
  /import\s+subprocess/,
  /os\.system/,
  /subprocess\.(run|call|Popen)/,
  /rm\s+-rf/,
  /exec\s*\(/,
  /eval\s*\(/,
  /require\s*\(\s*['"]child_process['"]\)/,
];

export function detectDangerousCode(code: string, langId: string): string | null {
  if (langId === 'html') return null;
  for (const pattern of DANGER_PATTERNS) {
    if (pattern.test(code)) {
      return '⚠️ Cod cu acces la sistem detectat. Rulează în sandbox izolat Piston — fără acces la mașina ta.';
    }
  }
  return null;
}

// ─── Execuție via Piston API ─────────────────────────────────────────────────

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
const TIMEOUT_MS = 15000;

export async function executeCode(
  langId: string,
  code: string,
  stdin?: string,
): Promise<ExecutionResult> {
  const lang = LANGUAGES.find(l => l.id === langId);
  if (!lang) {
    return { stdout: '', stderr: 'Limbaj necunoscut.', exitCode: -1, duration: 0 };
  }

  if (WEB_ONLY_LANGS.has(langId)) {
    return {
      stdout: '🌐 HTML/CSS se afișează în panoul de previzualizare de mai jos.',
      stderr: '',
      exitCode: 0,
      duration: 0,
    };
  }

  const pistonLang = lang.pistonLang ?? lang.id;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const resp = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: pistonLang,
        version: lang.version,
        files: [{ name: `main${lang.ext}`, content: code }],
        stdin: stdin ?? '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 10000,
      }),
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!resp.ok) {
      const errText = await resp.text();
      return {
        stdout: '',
        stderr: `Eroare server Piston (${resp.status}): ${errText.slice(0, 200)}`,
        exitCode: resp.status,
        duration,
      };
    }

    const data = await resp.json();
    const run = data.run ?? {};
    const compile = data.compile ?? {};

    const stderr = [compile.stderr, run.stderr].filter(Boolean).join('\n').trim();
    const stdout = [compile.stdout, run.stdout].filter(Boolean).join('\n').trim();

    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: run.code ?? 0,
      duration,
    };
  } catch (err: any) {
    const duration = Date.now() - startTime;
    if (err?.name === 'AbortError') {
      return {
        stdout: '',
        stderr: '⏱ Timeout: execuția a durat mai mult de 15 secunde.',
        exitCode: -1,
        duration,
      };
    }
    return {
      stdout: '',
      stderr: `Eroare rețea: ${err?.message ?? 'Verifică conexiunea la internet.'}`,
      exitCode: -1,
      duration,
      error: err?.message,
    };
  }
}

// ─── Formatare output ─────────────────────────────────────────────────────────

export function formatOutput(result: ExecutionResult): string {
  const parts: string[] = [];

  if (result.stdout) parts.push(result.stdout);
  if (result.stderr) parts.push(`⚠️ STDERR:\n${result.stderr}`);

  if (!result.stdout && !result.stderr) {
    parts.push('(fără output)');
  }

  parts.push(`\n✓ Finalizat în ${result.duration}ms | Exit: ${result.exitCode}`);
  return parts.join('\n');
}

// ─── Tutoriale pe limbaj ─────────────────────────────────────────────────────

export interface Tutorial {
  titlu: string;
  sectiuni: { subtitlu: string; continut: string }[];
}

export function getTutorial(langId: string): Tutorial | null {
  const tutoriale: Record<string, Tutorial> = {
    python: {
      titlu: '🐍 Python — Ghid rapid',
      sectiuni: [
        {
          subtitlu: 'Variabile și tipuri',
          continut: 'x = 10\nnume = "Jarvis"\npret = 3.14\nactiv = True\nlista = [1, 2, 3]\ndictionar = {"cheie": "valoare"}',
        },
        {
          subtitlu: 'Funcții și clase',
          continut: 'def aduna(a, b): return a + b\n\nclass Animal:\n    def __init__(self, nume): self.nume = nume\n    def salut(self): return f"Salut de la {self.nume}"',
        },
        {
          subtitlu: 'List comprehension',
          continut: 'patrate = [x**2 for x in range(10)]\nfiltre = [x for x in range(20) if x % 2 == 0]\ndict_comp = {k: v*2 for k, v in {"a": 1, "b": 2}.items()}',
        },
      ],
    },
    javascript: {
      titlu: '🟨 JavaScript — Ghid rapid',
      sectiuni: [
        {
          subtitlu: 'Variabile moderne',
          continut: 'const x = 10;\nlet y = 20;\nconst arr = [1, 2, 3];\nconst obj = { a: 1, b: 2 };\nconst [primul, ...rest] = arr; // destructuring',
        },
        {
          subtitlu: 'Funcții arrow + async',
          continut: 'const aduna = (a, b) => a + b;\n\nconst fetchDate = async () => {\n  const resp = await fetch(url);\n  return resp.json();\n};',
        },
        {
          subtitlu: 'Array methods',
          continut: 'const nums = [1,2,3,4,5];\nnums.map(x => x * 2);\nnums.filter(x => x > 2);\nnums.reduce((acc, x) => acc + x, 0);',
        },
      ],
    },
    typescript: {
      titlu: '🔷 TypeScript — Ghid rapid',
      sectiuni: [
        {
          subtitlu: 'Tipuri de bază',
          continut: 'let x: number = 10;\nlet s: string = "text";\nlet activ: boolean = true;\ntype ID = number | string;\ninterface User { id: number; name: string; }',
        },
        {
          subtitlu: 'Generics',
          continut: 'function identity<T>(arg: T): T { return arg; }\nconst numere: Array<number> = [1, 2, 3];\nconst map = new Map<string, number>();',
        },
        {
          subtitlu: 'Classes',
          continut: 'class Animal {\n  constructor(private name: string) {}\n  salut(): string { return `Bună, sunt ${this.name}`; }\n}\nconst a = new Animal("Rex");',
        },
      ],
    },
    java: {
      titlu: '☕ Java — Ghid rapid',
      sectiuni: [
        {
          subtitlu: 'Structuri de bază',
          continut: 'int x = 10;\nString text = "salut";\nboolean activ = true;\nint[] arr = {1, 2, 3};\nList<Integer> lista = new ArrayList<>();',
        },
        {
          subtitlu: 'Clase și OOP',
          continut: 'class Animal {\n    private String name;\n    public Animal(String n) { this.name = n; }\n    public String getNume() { return name; }\n}',
        },
        {
          subtitlu: 'Streams',
          continut: 'List<Integer> nums = List.of(1,2,3,4,5);\nint suma = nums.stream().mapToInt(Integer::intValue).sum();\nList<Integer> pare = nums.stream().filter(n -> n%2==0).toList();',
        },
      ],
    },
    go: {
      titlu: '🐹 Go — Ghid rapid',
      sectiuni: [
        {
          subtitlu: 'Sintaxă de bază',
          continut: 'x := 10\nnume := "Jarvis"\narr := []int{1, 2, 3}\nmap1 := map[string]int{"a": 1}\nconst PI = 3.14',
        },
        {
          subtitlu: 'Funcții și structuri',
          continut: 'func aduna(a, b int) int { return a + b }\n\ntype Animal struct {\n    Nume string\n    Specie string\n}\nfunc (a Animal) Salut() string { return a.Nume }',
        },
        {
          subtitlu: 'Goroutines',
          continut: 'var wg sync.WaitGroup\nwg.Add(1)\ngo func() {\n    defer wg.Done()\n    fmt.Println("goroutine")\n}()\nwg.Wait()',
        },
      ],
    },
  };

  return tutoriale[langId] ?? null;
}
