# Graph Report - jarvis-ai  (2026-05-17)

## Corpus Check
- 173 files · ~263,204 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1149 nodes · 2328 edges · 77 communities (74 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `219d4945`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 129 edges
2. `BrainContext` - 125 edges
3. `MemoryManager()` - 51 edges
4. `getDB()` - 38 edges
5. `ChatBubble` - 31 edges
6. `customFetch()` - 30 edges
7. `styles` - 27 edges
8. `AIProviderContext` - 22 edges
9. `orchestrator` - 19 edges
10. `processMessage()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Toaster()` --calls--> `useTheme()`  [INFERRED]
  artifacts/mockup-sandbox/src/components/ui/sonner.tsx → artifacts/jarvis/constants/colors.ts
- `createProject()` --calls--> `getDB()`  [EXTRACTED]
  artifacts/jarvis/engine/projectMemory.ts → artifacts/jarvis/engine/database.ts
- `addProjectStep()` --calls--> `getDB()`  [EXTRACTED]
  artifacts/jarvis/engine/projectMemory.ts → artifacts/jarvis/engine/database.ts
- `updateStepStatus()` --calls--> `getDB()`  [EXTRACTED]
  artifacts/jarvis/engine/projectMemory.ts → artifacts/jarvis/engine/database.ts
- `saveProjectFile()` --calls--> `getDB()`  [EXTRACTED]
  artifacts/jarvis/engine/projectMemory.ts → artifacts/jarvis/engine/database.ts

## Communities (77 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (47): DBStats, DEFAULT_SOURCE_META, FilterMode, KnowledgeScreen(), SOURCE_LABELS, analyzeDatabaseHealth(), autoPruneKnowledge(), bumpKnowledgeAccess() (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (47): seedDefaultAgents(), DEFAULT_SKILLS, deleteSkill(), detectSkill(), getAllSkills(), getSkillById(), saveSkill(), Skill (+39 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (55): addKey(), APIKey, deleteKey(), getKeyForProvider(), getKeys(), getWorkingKey(), hasValidKey(), incrementRequestCount() (+47 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (36): DiscoveredComponent, checkMetroHealth(), clearMetroCache(), downloadAssets(), downloadBundle(), downloadBundlesAndManifests(), downloadFile(), downloadManifest() (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (41): BrainSphereProps, LobeInfo, { width: SCREEN_WIDTH }, ChatBubble, CodeBlock, codeStyles, CSS_PROPERTIES, FeedbackToast() (+33 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (37): Awaited, AwaitedInput, getHealthCheckQueryOptions(), getHealthCheckUrl(), healthCheck(), HealthCheckQueryError, HealthCheckQueryResult, HealthCheckResponse (+29 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (42): useIsMobile(), cn(), Kbd(), KbdGroup(), ResizableHandle(), ResizablePanelGroup(), SheetContent, SheetContentProps (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (17): clearAllMemory(), deleteMemoryByKeyword(), deleteMemoryEntry(), deleteOldConversations(), ensureDirs(), getMemoryStats(), initMemoryFolder(), listAllMemories() (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (31): BrainContext, BrainContextType, migrateParsedState(), _syncEntitiesFromDB(), WELCOME, buildRichSystemPrompt(), JarvisContext, archiveCurrentSession() (+23 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (29): autoDetectFacts(), COMMAND_INTENTS, detectIntentWithConfidence(), handleDateTime(), handleMath(), handleMemory(), Intent, INTENT_PATTERNS (+21 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (22): AccordionContent, AccordionItem, AccordionTrigger, Avatar, AvatarFallback, AvatarImage, Checkbox, HoverCardContent (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (41): DashboardScreen(), LOBE_CONFIG, MemoryManager(), MemoryManagerProps, TabType, addFact(), chainReason(), createInferenceEngine() (+33 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (23): Action, ActionType, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState, reducer() (+15 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (15): ButtonGroup(), ButtonGroupSeparator(), buttonGroupVariants, Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup() (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (19): FileUploadModal(), KEYS, Props, DEV_QUICK_ACTIONS, QuickActions(), OPTIONS, SurveyBubble(), SurveyOption (+11 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (20): buildAICodePrompt(), buildDebugPrompt(), buildExpertSystemPrompt(), CODE_PATTERNS, CodeGenResult, DEBUG_PATTERNS, detectDevIntent(), EXPLAIN_PATTERNS (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.28
Nodes (17): providerIcon(), providerLabel(), useAIProvider(), BrainProvider(), useBrain(), useDevMode(), useLLM(), usePin() (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (18): ModelSetupScreen(), LLMContext, LLMContextType, LLMStatus, buildSystemPrompt(), downloadModel(), generateLLMResponse(), getModelPath() (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (19): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (15): addDynamicConcept(), Concept, DOMAIN_CONNECTIONS, DYNAMIC_CONCEPTS, findRelevantConcept(), findRelevantConceptExtended(), generateProactiveThought(), JARVIS_INTERESTS (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (12): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (5): ErrorBoundary, ErrorBoundaryState, ErrorFallback(), ErrorFallbackProps, useColors()

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (7): queryClient, linear(), LLMProvider(), PinContext, PinContextType, PinProvider(), TabLayout()

### Community 23 - "Community 23"
Cohesion: 0.2
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (15): _cacheResult(), extractSearchQuery(), extractTopSentences(), fetchWithTimeout(), isOnlineIntent(), ONLINE_TRIGGERS, OnlineResult, scrapeUrl() (+7 more)

### Community 27 - "Community 27"
Cohesion: 0.24
Nodes (14): pick(), buildFollowUp(), buildIllustration(), buildIntro(), detectQuestionType(), detectTopicCategory(), evaluateResponseQuality(), generateSmartUnknown() (+6 more)

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (6): app, Gallery(), getBasePath(), getPreviewExamplePath(), getPreviewPath(), ModuleMap

### Community 29 - "Community 29"
Cohesion: 0.3
Nodes (12): DICTIONAR, findDictEntryByKeywords(), searchDictionary(), searchDocuments(), extractKeywords(), fuzzyContains(), norm(), relevanceScore() (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.21
Nodes (12): Entity, EntityTracker, EntityType, extractEntities(), getEntitySummary(), normTxt(), NUMBER_PATTERNS, PLACE_PATTERNS (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (11): checkCreatorAccess(), CONSTITUTION_TEXT, ConstitutionCheck, ConstitutionState, generateIntegrityHash(), getSecurityReport(), MANIPULATION_PATTERNS, requiresCreator() (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (11): Carousel, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions, CarouselPlugin (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (15): INPUT_RANGE, JarvisSplash(), JarvisSplashProps, ringStyle(), TRAJECTORY, COMPLEXITY_COLORS, createEllipticalTrajectory(), INPUT_RANGE (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (6): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent

### Community 36 - "Community 36"
Cohesion: 0.2
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.24
Nodes (8): closeAndStartNewSession(), dayStart(), generateSessionSummary(), hasTemporalReference(), matchesTemporal(), queryTemporalMemory(), Session, TemporalMemory

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (8): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupText(), Input, Textarea

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (7): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableRow

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (6): { apiKey, body }, ctrl, { model, apiKey, body }, timer, data, router

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 43 - "Community 43"
Cohesion: 0.25
Nodes (10): connections, dist, NeuralBackground(), NodePulse(), nodes, Props, styles, { width, height } (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (5): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator()

### Community 46 - "Community 46"
Cohesion: 0.4
Nodes (3): apiClientReactSrc, apiZodSrc, root

### Community 47 - "Community 47"
Cohesion: 0.4
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 48 - "Community 48"
Cohesion: 0.13
Nodes (14): ✅ Completate recent (Sesiunile 7-8), [P1] Integrare ChatBubble + TypingIndicator + ChatHeader în ChatScreen, 🔴 P1 — Urgent / Blocat, [P1] Wave B Task 1 — BrainContext + recallWeighted + activeInference, 🟡 P2 — Important, [P2] Test end-to-end în Expo Go, [P2] Wave B Task 2 — Auto-delegare proactivă + comenzi agent, [P3] expo-navigation-bar Android nav bar auto-hide (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.4
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (4): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuViewport

### Community 51 - "Community 51"
Cohesion: 0.16
Nodes (11): DevModeContext, DevModeContextType, DevModeProvider(), addProjectStep(), createProject(), getActiveProject(), initProjectTables(), ProjectFile (+3 more)

### Community 60 - "Community 60"
Cohesion: 0.15
Nodes (12): BUG-001: Drag lag noduri canvas, BUG-002: Wave B Task 1 — BrainContext integrare ruptă, BUG-003: Wave B Task 2 — auto-delegare proactivă neimplementată, BUG-004: Theme apply necesită restart aplicație, BUG-R01: ThinkingIndicator trail alb orbita invers, BUG-R02: BrainSphere lobii invizibili, BUG-R03: MemoryManager CRUD nefuncțional, BUG-R04: SurveyBubble handleNo/handleYes șterse accidental (+4 more)

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (11): categorizeContent(), ExternalFolder, extractUsefulSentences(), getExternalFolders(), loadFolders(), removeExternalFolder(), requestFolderAccess(), saveFolders() (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.15
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormLabel, FormMessage (+2 more)

### Community 63 - "Community 63"
Cohesion: 0.2
Nodes (9): Git, graphify, JARVIS AI — Context Proiect, Modele Gemini, Pachete INTERZISE în Expo Go, Reguli STRICTE, Stack, Vault Knowledge Base (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.2
Nodes (9): 🎨 Animații React Native, 🏗️ Arhitectură & Patternuri, 🔑 AsyncStorage Keys (complete), 🧠 BrainContext / Memory, 🤖 Gemini CLI, 🔧 Git & Comenzi, 📚 KNOWLEDGE.md — Lecții acumulate, 📦 Pachete & Dependențe (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (7): 📁 Fișiere active (atenție la modificare), 🎯 Focus curent, 🔥 HOT.md — Context instant sesiune curentă, 📋 Next Actions (ordine prioritate), ⚠️ Reguli critice de reținut, 🚨 Stare critică, 🔄 Ultimele operații (Sesiunea 8)

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (6): AI & Providers, Arhitectură, 🏛️ DECISIONS.md — Decizii arhitecturale, Dev Workflow, Memorie, UI / Animations

### Community 69 - "Community 69"
Cohesion: 0.47
Nodes (3): reset(), rotate(), save_registry()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **321 isolated node(s):** `BUG-001: Drag lag noduri canvas`, `BUG-002: Wave B Task 1 — BrainContext integrare ruptă`, `BUG-003: Wave B Task 2 — auto-delegare proactivă neimplementată`, `BUG-004: Theme apply necesită restart aplicație`, `BUG-R01: ThinkingIndicator trail alb orbita invers` (+316 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `THEMES` connect `Community 14` to `Community 35`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 6` to `Community 10`, `Community 12`, `Community 13`, `Community 18`, `Community 20`, `Community 23`, `Community 24`, `Community 25`, `Community 32`, `Community 33`, `Community 35`, `Community 36`, `Community 38`, `Community 39`, `Community 41`, `Community 42`, `Community 44`, `Community 45`, `Community 47`, `Community 49`, `Community 50`, `Community 62`, `Community 71`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **Why does `BrainContext` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 7`, `Community 9`, `Community 11`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 22`, `Community 26`, `Community 27`, `Community 29`, `Community 30`, `Community 31`, `Community 37`, `Community 51`, `Community 61`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **What connects `BUG-001: Drag lag noduri canvas`, `BUG-002: Wave B Task 1 — BrainContext integrare ruptă`, `BUG-003: Wave B Task 2 — auto-delegare proactivă neimplementată` to the rest of the system?**
  _321 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._