
export type Intent =
  | 'salut' | 'ramas_bun' | 'multumesc' | 'ajutor' | 'ce_poti'
  | 'identitate_jarvis' | 'da' | 'nu' | 'gluma' | 'motivatie' | 'sfat'
  | 'data_ora' | 'matematica' | 'conversie_unitati'
  | 'memorie_salveaza' | 'memorie_citeste' | 'memorie_sterge' | 'memorie_uita_specific'
  | 'folder_acorda_acces' | 'folder_listeaza' | 'folder_actualizeaza'
  | 'documente_lista' | 'introducere_utilizator'
  | 'creator_declare' | 'creator_verify' | 'raport_invatare'
  | 'definitie' | 'opinie' | 'gandire_profunda'
  | 'conversatie_anterioara' | 'entitate' | 'inferenta' | 'temporala'
  | 'securitate' | 'constitutie' | 'follow_up' | 'cine_sunt_eu'
  | 'cmd_scriere' | 'cmd_traducere' | 'cmd_rezumat' | 'cmd_lista'
  | 'cmd_comparare' | 'cmd_plan' | 'cmd_creatie' | 'cmd_cod'
  | 'unknown';

export const COMMAND_INTENTS = new Set<Intent>([
  'cmd_scriere', 'cmd_traducere', 'cmd_rezumat', 'cmd_lista',
  'cmd_comparare', 'cmd_plan', 'cmd_creatie', 'cmd_cod',
]);

export function detectIntent(text: string): Intent {
    // Logica de detecție va fi mutată aici
    return 'unknown';
}
