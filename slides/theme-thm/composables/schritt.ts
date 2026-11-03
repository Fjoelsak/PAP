/*
  Gemeinsamer Teil der Abbildungen, die sich über `schritt` aufbauen
  (auf der Folie `:schritt="$clicks"`):

    s      der Schritt, begrenzt auf 0 … max — weitere Klicks der Folie
           lassen die Abbildung im Endzustand stehen
    ruhig  wahr im Export; als Klasse an der Abbildung schaltet sie die
           Übergänge ab (Regel `.ruhig` in styles/slides.css), damit kein
           Klickschritt mitten im Übergang aufgenommen wird

  Verwendung:
    const props = withDefaults(defineProps<{ schritt?: number }>(), { schritt: 3 })
    const { s, ruhig } = useSchritt(props, 3)
    <figure :class="[`s${s}`, { ruhig }]">
*/
import { computed } from 'vue'
import { useNav } from '@slidev/client'

export function useSchritt(props: { schritt: number }, max: number) {
  const { isPrintMode } = useNav()
  const s = computed(() => Math.max(0, Math.min(max, props.schritt)))
  return { s, ruhig: isPrintMode }
}
