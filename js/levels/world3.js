/**
 * Dossier 3 : double fond. Deux étapes : retirer les lingots, puis partager.
 * L'ordre compte : partager d'abord casse souvent un lingot.
 */
export default {
  id: 3,
  title: 'Double fond',
  subtitle: 'Deux étapes, dans le bon ordre',
  briefing: 'Les contrebandiers cachent maintenant les mallettes sous plusieurs couches. Il faudra deux opérations pour les démasquer. Réfléchis à l\'ordre : enlever d\'abord ce qui entoure les mallettes, ou partager tout de suite ?',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '3-1', start: '2x+1=9', cards: ['-1', '/2'], par: 2,
      intro: 'Double fond : deux mallettes et un lingot. Essaie de partager en 2 tout de suite… puis essaie dans l\'autre ordre.' },
    { id: '3-2', start: '3x+2=11', cards: ['/3', '-2'], par: 2,
      intro: 'Retiens la méthode : d\'abord on retire les lingots qui accompagnent les mallettes, ensuite on partage.' },
    { id: '3-3', start: '2x+5=17', cards: ['-2', '-5', '/2'], par: 2 },
    { id: '3-4', start: '22=4x+2', cards: ['/2', '-2', '/4'], par: 2,
      intro: 'Plusieurs chemins mènent à la mallette. Le QG l\'a fait en 2 coups : à toi.' },
    { id: '3-5', start: '5x+3=38', cards: ['-5', '-3', '/5'], par: 2 },
    { id: '3-6', start: '2x+6=10', cards: ['-2', '/2', '-6'], par: 2,
      intro: 'Ici, partager d\'abord fonctionne aussi : 6 lingots se partagent bien en 2. Les deux ordres sont justes.' },
    { id: '3-7', start: '3x+6=27', cards: ['-3', '/3', '-2', '-6'], par: 2 },
    { id: '3-8', start: '6x+12=60', cards: ['/2', '/3', '/6', '-6', '-12'], par: 2,
      outro: 'Double fond démasqué : tu sais défaire une affaire en deux étapes. Mais que faire quand des mallettes se cachent des deux côtés de la balance ?' },
  ],
};
