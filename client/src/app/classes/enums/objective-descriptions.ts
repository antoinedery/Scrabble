// Disable de lint autorisé par chargés
/* eslint-disable max-len */
export enum ObjectiveDescription {
    OBJECTIVE1 = 'Former un mot qui est déjà présent sur le plateau du jeu',
    OBJECTIVE2 = 'Utiliser 3 voyelles dans un placement de lettres',
    OBJECTIVE3 = 'Former trois mots avec un placement de lettres',
    OBJECTIVE4 = 'Former un mot qui contient la lettre V (V doit provenir du chevalet)',
    OBJECTIVE5 = 'Faire des placements valides pendant 4 tours consécutifs',
    OBJECTIVE6 = 'Faire un placement valide avec 5 lettres du chevalet dans les 10 premières secondes de son tour (incluant le temps de validation de 3 secondes)',
    OBJECTIVE7 = 'Faire un placement valide qui touche deux cases bonus',
    OBJECTIVE8 = 'Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs',
}
