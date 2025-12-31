/**
 * Dictionary of grocery categories with keywords for automatic categorization.
 * This approach covers 90% of common grocery items without needing AI.
 */

export const GROCERY_CATEGORIES: Record<string, string[]> = {
  'Fruits & Légumes': [
    'pomme', 'banane', 'orange', 'citron', 'tomate', 'salade', 'carotte',
    'courgette', 'aubergine', 'poivron', 'concombre', 'haricot', 'petit pois',
    'épinard', 'brocoli', 'chou', 'oignon', 'ail', 'échalote', 'poireau',
    'céleri', 'fenouil', 'artichaut', 'asperge', 'radis', 'navet', 'betterave',
    'patate douce', 'pomme de terre', 'champignon', 'avocat', 'poire', 'pêche',
    'abricot', 'prune', 'cerise', 'fraise', 'framboise', 'myrtille', 'mûre',
    'cassis', 'groseille', 'raisin', 'melon', 'pastèque', 'kiwi', 'mangue',
    'ananas', 'papaye', 'fruit de la passion', 'litchi', 'grenade', 'figue',
    'datte', 'noix de coco', 'citron vert', 'pamplemousse', 'clémentine', 'mandarine',
    'endive', 'laitue', 'chou-fleur', 'poireau', 'courge', 'potiron', 'butternut',
    'patate', 'topinambour', 'panais', 'salsifis', 'rhubarbe', 'cresson',
    'roquette', 'mâche', 'pissenlit', 'épinard', 'bette', 'fenouil', 'cèpe',
    'girolle', 'morille', 'shiiitaké', 'truffe', 'abricot', 'brugnon', 'nectarine',
    'kaki', 'coing', 'goyave', 'litchi', 'longane', 'pitaya', 'physalis',
  ],

  'Produits Laitiers': [
    'lait', 'fromage', 'beurre', 'yaourt', 'crème', 'crème fraiche', 'crème fraîche',
    'oeuf', 'oeufs', 'mozzarella', 'parmesan', 'gruyère', 'emmental', 'comté',
    'camembert', 'brie', 'roquefort', 'chèvre', 'feta', 'mascarpone', 'ricotta',
    'cottage cheese', 'petit suisse', 'fromage blanc', 'faisselle', 'kéfir',
    'lait de coco', 'lait d\'amande', 'lait de soja', 'lait d\'avoine', 'lait de riz',
    'lait de noisette', 'lait d\'anacarde', 'yaourt à boire', 'brie de meaux',
    'reblochon', 'térame', ' saint-paulin', 'béarnais', 'cantap', 'bordeaux',
  ],

  'Boulangerie': [
    'pain', 'baguette', 'croissant', 'brioche', 'pain de mie', 'pain complet',
    'pain aux céréales', 'pain de campagne', 'ficelle', 'pain au chocolat',
    'chausson aux pommes', 'pain aux raisins', 'éclair', 'religieuse', 'mille-feuille',
    'tarte', 'gâteau', 'cookie', 'madeleine', 'financier', 'macaron', 'meringue',
    'chouquette', 'beignet', 'donut', 'crêpe', 'gaufre', 'pancake', 'bagel',
    'muffin', 'scone', 'brownie', 'cake', 'quatre-quarts', 'madeleine', 'financier',
    'kouign-amann', 'pain au lait', 'pain brioché', 'brioche', 'croissant au beurre',
    'croissant aux amandes', 'pain aux graines', 'pain aux noix', 'pain aux olives',
  ],

  'Viandes & Poissons': [
    'poulet', 'boeuf', 'porc', 'agneau', 'veau', 'canard', 'dinde', 'lapin',
    'saumon', 'thon', 'cabillaud', 'colin', 'merlu', 'sole', 'bar', 'loup',
    'dorade', 'truite', 'sardine', 'maquereau', 'hareng', 'anchois', 'crevette',
    'gambas', 'langoustine', 'homard', 'crabe', 'moule', 'huître', 'coquille saint-jacques',
    'calamar', 'poulpe', 'steak', 'côtelette', 'rôti', 'escalope', 'filet',
    'entrecôte', 'bavette', 'onglet', 'rumsteak', 'jambon', 'bacon', 'lardons',
    'saucisse', 'merguez', 'chipolata', 'boudin', 'andouillette', 'pâté', 'terrine',
    'rillettes', 'foie gras', 'magret', 'aiguillette', 'poitrine', 'épaule', 'gigot',
  ],

  'Surgelés': [
    'glace', 'sorbet', 'pizza surgelée', 'légumes surgelés', 'frites surgelées',
    'poisson pané', 'nuggets', 'cordon bleu', 'crêpes surgelées', 'pain surgelé',
    'fruits surgelés', 'plat cuisiné surgelé', 'bûche glacée', 'gâteau surgelé',
    'surgelé', 'surgelés', 'congelé', 'congelés',
  ],

  'Épicerie': [
    'pâtes', 'riz', 'huile', 'sel', 'sucre', 'café', 'thé', 'chocolat', 'confiture',
    'miel', 'nutella', 'céréales', 'farine', 'levure', 'maïzena', 'semoule',
    'quinoa', 'boulgour', 'lentilles', 'pois chiches', 'haricots secs', 'conserves',
    'sauce tomate', 'ketchup', 'mayonnaise', 'moutarde', 'vinaigre', 'épices',
    'herbes', 'bouillon', 'soupe', 'biscuits', 'chips', 'crackers', 'pop-corn',
    'fruits secs', 'noix', 'amandes', 'noisettes', 'cacahuètes', 'pistaches',
    'pâtes alimentaires', 'spaghetti', 'tagliatelle', 'penne', 'rigatoni', 'macaroni',
    'riz basmati', 'riz thaï', 'riz complet', 'riz gluant', 'huile d\'olive', 'huile de tournesol',
    'vinaigre balsamique', 'vinaigre de vin', 'soja', 'sauce soja', 'curry', 'paprika',
    'cumin', 'coriandre', 'cannelle', 'gingembre', 'poivre', 'sel marin', 'fleur de sel',
  ],

  'Boissons': [
    'eau', 'eau gazeuse', 'jus', 'jus d\'orange', 'jus de pomme', 'soda', 'coca',
    'limonade', 'vin', 'vin rouge', 'vin blanc', 'vin rosé', 'bière', 'cidre',
    'champagne', 'whisky', 'vodka', 'rhum', 'gin', 'tequila', 'apéritif', 'digestif',
    'sirop', 'smoothie', 'milkshake', 'café moulu', 'café en grains', 'capsules café',
    'thé vert', 'thé noir', 'tisane', 'infusion', 'tisanes', 'rooibos', 'matcha',
    'verveine', 'menthe', 'camomille', 'eau minérale', 'eau de source', 'eau plate',
    'eau pétillante', 'perrier', 'badoit', 'contrex', 'volvic', 'evian',
  ],

  'Hygiène & Maison': [
    'savon', 'shampoing', 'après-shampoing', 'gel douche', 'dentifrice', 'brosse à dents',
    'déodorant', 'crème hydratante', 'rasoir', 'mousse à raser', 'coton', 'coton-tige',
    'mouchoirs', 'papier toilette', 'essuie-tout', 'lessive', 'adoucissant',
    'liquide vaisselle', 'éponge', 'sac poubelle', 'produit ménager', 'désinfectant',
    'javel', 'nettoyant sol', 'nettoyant vitres', 'lingette', 'serviette', 'gant de toilette',
    'parfum', 'cosmétique', 'maquillage', 'crème solaire', 'moustiquaire', 'brosse',
    'balai', 'aspirateur', 'serpillière', 'seau', 'pile', 'ampoule', 'allumette',
    'bougie', 'couvercle', 'film alimentaire', 'papier aluminium', 'essuie-tout',
  ],
}

export type GroceryCategory = keyof typeof GROCERY_CATEGORIES | 'Autres'

export const ALL_CATEGORIES: GroceryCategory[] = [
  'Fruits & Légumes',
  'Produits Laitiers',
  'Boulangerie',
  'Viandes & Poissons',
  'Surgelés',
  'Épicerie',
  'Boissons',
  'Hygiène & Maison',
  'Autres',
]
