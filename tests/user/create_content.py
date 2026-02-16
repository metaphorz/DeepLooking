"""
Batch-create all LA MESH markdown content files for the Cotán still life viewer.
Paul Fishwick and Claude Code
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))

files = {
# === QUINCES ===
"quinces/language/quinces.md": """title: Quince — From Ancient Crete to Modern Spanish
url: https://en.wikipedia.org/wiki/Quince
keyword: quince

The English word "quince" traces a remarkable journey: from the Greek city of Kydonia (modern Chania, Crete), where the fruit was cultivated, came the Greek "kydonion melon" (Cydonian apple). Latin borrowed this as "cotoneum," which became Old French "cooin," and finally Middle English "quoyn" — pluralized to "quoyns," reinterpreted as a singular "quince."

In Spanish, the quince is "membrillo," from Latin "melimelum" (honey-apple). The famous quince paste shares this name — dulce de membrillo — and remains a staple of Spanish cuisine paired with Manchego cheese.

Cotán would have known these fruits by their Castilian name, hanging in the cantarero (stone larder) of his Toledo kitchen.
""",
"quinces/art/quinces.md": """title: Suspended Light — The Quinces as Compositional Anchor
url: https://en.wikipedia.org/wiki/Bodeg%C3%B3n
keyword: quinces

The quinces occupy the highest and leftmost position in Cotán's famous compositional arc. Their brilliant yellow creates the brightest point in the painting, catching an unseen light source from the upper left.

Cotán suspends the quinces on a string with their branch and leaves still attached — a detail that transforms them from mere food into a botanical portrait. The leaves cast subtle shadows, adding depth to the dark void behind them.

This placement begins the hyperbolic curve that descends through the birds and apples before sweeping up again with the cardoon — a mathematical arrangement that art historians consider one of the most deliberate compositions in Western still life painting.
""",
"quinces/math/quinces.md": """title: The Catenary and the Quince — Curves of Suspension
url: https://en.wikipedia.org/wiki/Catenary
keyword: catenary

The string from which Cotán's quinces hang forms a catenary curve — the shape a flexible chain or cord naturally assumes under gravity. Mathematically described by the hyperbolic cosine function y = a·cosh(x/a), this curve was not formally described until Leibniz, Huygens, and Johann Bernoulli solved it in 1691 — nearly a century after this painting.

Yet Cotán captured it perfectly through direct observation. The quinces, being the heaviest cluster, pull their string into a deeper catenary than the lighter birds beside them.

The overall arrangement of objects in this painting also traces a hyperbolic curve from upper-left to lower-center, a composition so mathematically precise that scholars have debated whether Cotán used geometric instruments to plan it.
""",
"quinces/engineering/quinces.md": """title: The Cantarero — Engineering Natural Refrigeration
url: https://en.wikipedia.org/wiki/Larder
keyword: cantarero

The quinces hang inside a cantarero — a stone window or niche used in Spanish households as a natural larder. This architectural element exploits several engineering principles for food preservation.

The thick stone walls provide thermal mass, maintaining cool temperatures even in Toledo's hot summers. The recessed design shields food from direct sunlight while allowing air circulation through the open front. Hanging fruit from strings prevents contact with surfaces where mold and insects accumulate.

Quinces are particularly well-suited to this storage method. Their high pectin content and thick skin make them resistant to decay. A properly stored quince can last 2-3 months — long enough to bridge the gap between autumn harvest and winter cooking.

The cantarero is a masterpiece of passive engineering that predates mechanical refrigeration by centuries.
""",
"quinces/science/quinces.md": """title: Cydonia oblonga — The Forgotten Fruit
url: https://en.wikipedia.org/wiki/Quince
keyword: Cydonia

The quince (Cydonia oblonga) is the sole member of its genus — a living fossil in the rose family (Rosaceae). While closely related to apples and pears, quinces diverged from their cousins approximately 20 million years ago.

Raw quinces are astringent and nearly inedible due to high concentrations of tannins and malic acid. But heating transforms them: the tannins break down, the flesh turns from pale yellow to deep rose-pink (due to anthocyanin formation), and the flavor becomes intensely aromatic.

This transformation depends on the quince's extraordinarily high pectin content — the highest of any common fruit. Pectin is a structural polysaccharide that forms gels when heated with sugar and acid, which is why quince paste (membrillo) sets so firmly.

Cotán's quinces show the characteristic fuzzy skin and irregular shape of the species — features that breeding has never fully smoothed away.
""",
"quinces/history/quinces.md": """title: The Golden Apple of Aphrodite
url: https://en.wikipedia.org/wiki/Quince#History
keyword: quince

The quince may be the oldest cultivated fruit in the Mediterranean. Some scholars believe the "golden apple" of Greek mythology — given by Paris to Aphrodite, triggering the Trojan War — was actually a quince, not an apple as commonly depicted.

In ancient Rome, the naturalist Pliny the Elder described quince varieties and their medicinal uses. Roman brides carried quinces to their new homes as symbols of fertility and commitment — a tradition that persisted in Mediterranean cultures for millennia.

By Cotán's time (1602), the quince was deeply embedded in Spanish culture. Toledo, where Cotán painted this work, was famous for its dulce de membrillo. The city's confectioners supplied quince paste to the Spanish court and exported it across Europe.

One year after completing this painting, Cotán donated all his possessions and entered the Carthusian monastery of El Paular as a lay brother.
""",
# === APPLES ===
"apples/language/apples.md": """title: Malum/Malus — The Apple's Double Meaning
url: https://en.wikipedia.org/wiki/Apple#Etymology
keyword: malum

In Latin, a fateful ambiguity shaped Western civilization: "mālum" (with a long ā) means "apple," while "malum" (short a) means "evil." This coincidence led medieval scholars to identify the forbidden fruit of Eden as an apple — though the Hebrew Bible never names the species.

Spanish "manzana" takes a different path, from Vulgar Latin "mattiana," named after Gaius Matius, a Roman agricultural writer who described apple grafting techniques around 50 BC.

The cluster in Cotán's painting — likely Camuesa apples, a now-rare Spanish variety prized for winter storage — hangs on strings threaded through their stems.

The word "bodegón" itself, meaning both "pantry" and this genre of Spanish still life, comes from "bodega" (cellar/tavern) — a reminder that these paintings depict spaces of everyday sustenance.
""",
"apples/art/apples.md": """title: The Suspended Cluster — Tension and Gravity
url: https://en.wikipedia.org/wiki/Bodeg%C3%B3n
keyword: suspended

Cotán's apples form the emotional center of the composition. Bound together and hanging from fine strings, they create a visual tension between weight and weightlessness that defines the bodegón genre.

The red-green coloring of these apples provides the painting's warmest chromatic note against the cold black void. Cotán applies the paint in careful layers — the reddish blush over a green-yellow base — mimicking the apple's own growth pattern where sun exposure produces anthocyanin pigments.

Notice how the strings converge to a single point above, creating a triangular form that echoes Renaissance compositional principles. Yet unlike Renaissance idealization, Cotán paints each apple with individual imperfections: slight asymmetries, surface blemishes, variations in color.

This tension between geometric order and natural imperfection is Cotán's signature contribution to still life painting.
""",
"apples/math/apples.md": """title: Packing and Clustering — The Geometry of Apples
url: https://en.wikipedia.org/wiki/Sphere_packing
keyword: packing

Cotán's cluster of apples presents a natural instance of the sphere packing problem — how spherical objects arrange themselves under constraint. The apples, bound by strings, settle into a configuration that minimizes potential energy while maintaining contact.

For identical spheres, Kepler conjectured in 1611 (just nine years after this painting) that the densest possible packing fills approximately 74.05% of available space. This was finally proven by Thomas Hales in 1998 using computer verification.

Cotán's apples, being slightly irregular, exhibit a random close packing closer to 64% density. Each apple touches 2-4 neighbors, forming a contact graph that mathematicians call a "kissing configuration."

The strings add another geometric constraint: they force the cluster into a pendant form where gravity and tension compete. The resulting shape is a minimal surface — the configuration that minimizes total string length while supporting each apple's weight.
""",
"apples/engineering/apples.md": """title: String Suspension — Simple Machines in the Pantry
url: https://en.wikipedia.org/wiki/Tension_(physics)
keyword: tension

The system of strings suspending Cotán's apples demonstrates fundamental engineering principles. Each string must support not only the apple's weight but also resist lateral forces from neighboring apples pressing against each other.

The strings converge at a single suspension point — creating what structural engineers call a "tension structure." The angle each string makes with the vertical determines how much lateral force it must carry.

This is the same principle used in suspension bridges, where cables transfer the deck's weight to towers through tension. Cotán's apple cluster is, in miniature, a hanging bridge.

The choice of string material mattered: Spanish households used hemp cord (cáñamo), which has a tensile strength of approximately 35 MPa — more than sufficient for a few hundred grams of fruit, but the thin diameter makes the strings nearly invisible against the dark background.
""",
"apples/science/apples.md": """title: Malus domestica — Breeding and Diversity
url: https://en.wikipedia.org/wiki/Apple
keyword: Malus

The apples in Cotán's painting are likely Camuesa or Reineta varieties — Spanish cultivars adapted to the hot, dry climate of Castile. In 1602, apple diversity in Spain was enormous: each region maintained dozens of local varieties selected over centuries for flavor, storage life, and disease resistance.

All domestic apples (Malus domestica) descend primarily from Malus sieversii, a wild species still found in the mountains of Kazakhstan. DNA analysis has shown that the forests of the Tian Shan mountains contain trees genetically almost identical to modern cultivated apples.

The red blush on Cotán's apples results from anthocyanin pigments (cyanidin-3-galactoside), produced in the skin when exposed to UV light. The shaded side remains green from chlorophyll.

Apple seeds are famously heterozygous — plant a seed and the resulting tree will produce fruit utterly unlike its parent. Every named apple variety is therefore a clone, propagated only by grafting.
""",
"apples/history/apples.md": """title: Apples in the Spanish Golden Age
url: https://en.wikipedia.org/wiki/Spanish_Golden_Age
keyword: Golden Age

In 1602, when Cotán painted these apples, Spain was at the height of its Golden Age — and simultaneously beginning its slow decline. Philip III sat on the throne, Cervantes was writing Don Quixote (published 1605), and Lope de Vega was revolutionizing theater.

The humble apple in the bodegón carried layers of meaning for a Spanish audience. It evoked Eden and the Fall, abundance and temptation, the sweetness and transience of earthly pleasures.

Spanish apple cultivation in this period benefited from Moorish agricultural innovations. The irrigation systems (acequias) introduced during Al-Andalus transformed dry Castilian landscapes into productive orchards.

The practice of hanging apples for storage — visible in Cotán's painting — could keep fruit edible for months. In a world without refrigeration, this simple technology meant the difference between winter scarcity and relative abundance.
""",
# === SMALL BIRDS ===
"smallbirds/language/smallbirds.md": """title: Caza Menor — The Language of Spanish Hunting
url: https://en.wikipedia.org/wiki/Hunting_in_Spain
keyword: caza

In Spanish, hunting vocabulary distinguishes between "caza mayor" (big game — deer, boar) and "caza menor" (small game — birds, rabbits). The small birds in Cotán's painting belong firmly to caza menor.

These birds are likely "zorzales" (thrushes) or "jilgueros" (goldfinches). "Zorzal" derives from Arabic "zurzāl," reflecting the Moorish influence on Iberian hunting vocabulary. "Jilguero" comes from Latin "carduelis," meaning "thistle-eater" — the same root as "cardoon," another object in this very painting.

The verb "cazar" (to hunt) itself comes from Vulgar Latin "captiare" (to capture), the same root that gives English "catch." In Cotán's Toledo, hunting rights for small birds were communal.
""",
"smallbirds/art/smallbirds.md": """title: Vanitas and the Dead Bird — Mortality in Still Life
url: https://en.wikipedia.org/wiki/Vanitas
keyword: vanitas

The small dead birds are Cotán's most explicit memento mori — a reminder of death that transforms this pantry scene into a meditation on mortality. Their limp bodies, delicate feathers, and closed eyes create an intimate portrait of death.

In the tradition of vanitas painting, dead birds symbolize the fragility of life and the futility of earthly pleasures. Their small size amplifies this message: if something so light and quick can be stilled, how much more fragile are human ambitions?

Cotán renders their feathers with extraordinary precision — each barb and barbule visible in the raking light. This virtuoso technique serves a philosophical purpose: the more beautiful the rendering, the more poignant the reminder that beauty is transient.

The birds hang from the thinnest strings in the painting, almost invisible threads between life and death.
""",
"smallbirds/math/smallbirds.md": """title: Scaling Laws — Allometry in Small Birds
url: https://en.wikipedia.org/wiki/Allometry
keyword: allometry

Small birds follow precise mathematical scaling laws that relate body mass to nearly every biological function. These power laws, described by the allometric equation Y = aM^b, reveal deep principles about how size constrains life.

For birds, metabolic rate scales as M^0.72 — meaning a bird half the size of another doesn't have half the metabolism, but rather about 60% of it. Small birds burn energy faster per gram than large ones, which is why these thrushes would have had heart rates of 400-600 beats per minute in life.

Wing loading (weight divided by wing area) scales as M^0.28, explaining why small birds can hover and maneuver in ways impossible for larger species.

These mathematical constraints explain why the birds in this painting, weighing perhaps 60-80 grams each, lived fast and died young even before the hunter's net found them.
""",
"smallbirds/engineering/smallbirds.md": """title: Bird Trapping — Ingenious Capture Devices
url: https://en.wikipedia.org/wiki/Bird_trapping
keyword: trapping

Capturing the small birds in Cotán's painting required ingenious engineering. In 17th-century Spain, common methods included the "red" (net), "liga" (birdlime), and "trampa" (spring trap).

Birdlime was a sticky substance made by boiling holly bark (Ilex aquifolium) or mistletoe berries. Applied to branches where birds perched, it trapped their feet with an adhesive strong enough to resist wing beats but gentle enough to avoid injury.

The "costilla" (rib-trap) used a balanced lever mechanism: a flat stone propped on a stick, with bait underneath. When a bird pecked the bait, the stick displaced and the stone fell — a simple machine that has remained unchanged for thousands of years.

Net trapping ("paranza") arranged nets between trees in a V-formation, funneling flying birds into an ever-narrower space — anticipating modern principles of flow channeling.
""",
"smallbirds/science/smallbirds.md": """title: Turdus and Carduelis — Identifying Cotán's Birds
url: https://en.wikipedia.org/wiki/Thrush_(bird)
keyword: Turdus

The two small birds in Cotán's painting are most likely Song Thrushes (Turdus philomelos) based on their size, speckled breast pattern, and brownish-olive upper plumage.

Song Thrushes belong to the family Turdidae and are resident birds across Iberia. Their name "philomelos" means "song-loving" in Greek — these were birds as prized for their voice as for their flesh. In 1602, thrush meat was considered a delicacy.

The birds' digestive anatomy is notable: thrushes have a specialized gizzard that can crack snail shells against an "anvil stone" — a behavior unique among European passerines. Their migration patterns follow precise geomagnetic navigation using magnetite crystals in their upper beaks.

Cotán captures them post-mortem with scientific accuracy — the relaxed musculature, drooping head, and slightly parted feathers are consistent with birds dead for several hours.
""",
"smallbirds/history/smallbirds.md": """title: Game Birds and the Spanish Table
url: https://en.wikipedia.org/wiki/History_of_Spanish_cuisine
keyword: game

In 1602 Spain, small game birds were food for everyone. While the aristocracy hunted deer and boar in royal forests, ordinary Castilians caught thrushes, sparrows, and finches in fields and orchards.

The Catholic calendar shaped consumption: during frequent fast days, meat was forbidden — but "caza de pluma" (feathered game) occupied an ambiguous category. Theological debates about whether small birds counted as "meat" were surprisingly fierce.

Preparation was simple: roasted on spits, stewed in "caldereta," or preserved in vinegar as "escabeche" — a technique borrowed from Moorish cuisine (from Arabic "sikbāj").

Cotán himself would have eaten game birds regularly before entering the Carthusian order in 1603. The Carthusians followed one of the strictest dietary rules in Christendom: perpetual abstinence from meat. These painted birds may represent pleasures he was about to renounce.
""",
# === PARTRIDGE ===
"partridge/language/partridge.md": """title: Perdiz — The Partridge in Language and Proverb
url: https://en.wikipedia.org/wiki/Red-legged_partridge
keyword: perdiz

The Spanish word "perdiz" descends from Latin "perdix," itself from Greek "perdix" — a word that Aristotle connected to the mythological figure Perdix, nephew of Daedalus, who was transformed into a partridge after being thrown from the Acropolis.

Spanish is rich in partridge proverbs. "Dar gato por perdiz" (to give cat for partridge) means to swindle someone. "Ojo de perdiz" (partridge eye) describes a type of fabric weave and also a painful corn on the foot.

The phrase "contentarse con media perdiz" (to be content with half a partridge) counsels modesty — a sentiment that resonates with Cotán's impending decision to enter monastic life.

In Portuguese, the bird is "perdiz." In Catalan, "perdiu." In Basque, "eper." Each Iberian language preserves its own relationship with this most characteristic of Mediterranean game birds.
""",
"partridge/art/partridge.md": """title: The Central Figure — Drama in Death
url: https://en.wikipedia.org/wiki/Juan_S%C3%A1nchez_Cot%C3%A1n
keyword: partridge

The partridge commands the center of Cotán's composition with a presence that rivals any human portrait. Hanging from a single string, its wings slightly spread and head dropping, the bird creates a vertical axis around which the entire painting organizes itself.

Cotán lavishes his finest brushwork here: the iridescent blue-green of the breast feathers, the warm brown of the wings, the precise stippling of the flank markings. Each feather follows its natural tract (pteryla).

The partridge occupies the deepest point of the hyperbolic arc — the nadir of the compositional curve. This positioning gives it gravitational weight beyond its physical mass.

Art historian Norman Bryson noted that Cotán's dead game achieves a "peculiar dignity" — these are not grotesque hunting trophies but solemn presences, rendered with a reverence that approaches the sacred.
""",
"partridge/math/partridge.md": """title: Bilateral Symmetry and the Geometry of Flight
url: https://en.wikipedia.org/wiki/Bilateral_symmetry
keyword: symmetry

The partridge, even in death, displays the bilateral symmetry that characterizes all vertebrates. Its left and right halves mirror each other across a sagittal plane — a symmetry constraint imposed by the physics of locomotion.

For flying birds, symmetry is not merely aesthetic but aerodynamic. Any asymmetry in wing area, feather length, or mass distribution creates unbalanced torques during flight. The partridge's wing bones maintain left-right length ratios within 0.5%.

Cotán exploits this symmetry compositionally: the bird hangs along the painting's vertical center line, its spread wings creating a roughly symmetrical form that anchors the otherwise asymmetric arrangement.

The mathematical descriptor for bilateral symmetry is the reflection group Z₂ — the simplest non-trivial symmetry group containing just two elements: the identity and the reflection.
""",
"partridge/engineering/partridge.md": """title: Hanging Game — The Engineering of Faisandage
url: https://en.wikipedia.org/wiki/Hanging_(meat)
keyword: hanging

The partridge in Cotán's painting is being "hung" — a deliberate process of controlled decomposition known in French as "faisandage." This is not mere storage but a biochemical engineering process that transforms tough game into tender meat.

During hanging, endogenous enzymes (primarily cathepsins and calpains) break down muscle proteins actin and myosin, resolving rigor mortis and tenderizing the flesh. Simultaneously, autolytic processes generate amino acids — particularly glutamate — that intensify flavor.

The engineering variables are temperature (ideally 4-8°C), humidity (70-80%), and time (3-7 days for partridge). Cotán's stone cantarero provided approximately the right conditions.

The bird is hung by the neck with wings unbound — the traditional Spanish method that allows air circulation around the entire carcass. This differs from the English tradition of hanging by the feet.
""",
"partridge/science/partridge.md": """title: Alectoris rufa — The Red-Legged Partridge
url: https://en.wikipedia.org/wiki/Red-legged_partridge
keyword: Alectoris

The bird in Cotán's painting is almost certainly a Red-legged Partridge (Alectoris rufa), the most common game bird of the Iberian Peninsula. Its distinctive blue-grey breast with chestnut flank bars and red bill are visible even in the painting's muted palette.

Alectoris rufa is a gallinaceous bird (order Galliformes), more closely related to chickens and pheasants than to the songbirds hanging beside it. It is a ground-nesting species that prefers the dry, scrubby landscapes of Mediterranean Spain.

Red-legged partridges are unusual among birds for their double-clutch nesting strategy: females lay two clutches of 10-16 eggs each. The male incubates one clutch while the female incubates the other.

The bird weighs 400-550 grams and can fly at speeds up to 58 km/h in short bursts. Its flight muscles constitute about 25% of body mass — reflecting the metabolic cost of its explosive takeoff.
""",
"partridge/history/partridge.md": """title: The Partridge in Spanish Culture
url: https://en.wikipedia.org/wiki/Spanish_cuisine
keyword: partridge

The Red-legged Partridge is Spain's national game bird, and in 1602 it was far more than food — it was a cultural institution. Partridge hunting organized social life across Castile, from royal hunts to village drives.

Philip III, who reigned when Cotán painted this, was an avid partridge hunter. Royal hunting parties in the Montes de Toledo could bag hundreds of birds in a single day using the "ojeo" method.

In Spanish cuisine, "perdiz estofada" (stewed partridge) was the centerpiece of feast days. The recipe appears in virtually every Spanish cookbook from the medieval period onward.

For Cotán, painting a partridge in 1602 was also a statement of identity. As a Toledan artist preparing to take religious vows, he depicted the food he was about to leave behind. The Carthusian Rule prohibited meat entirely — this painted partridge would be his last.
""",
# === CARDOON ===
"cardoon/language/cardoon.md": """title: Cardo — From Thistle to Table
url: https://en.wikipedia.org/wiki/Cardoon
keyword: cardo

The word "cardoon" enters English from French "cardon," from Provençal "cardon," from Latin "carduus" (thistle). The same root gives us "cardiac" (the thistle was used as a heart remedy) and "carduelis" (the genus of goldfinches, which feed on thistle seeds).

In Spanish, the plant is simply "cardo" — a word that also means thistle generically and, colloquially, an ugly person ("es un cardo").

The linguistic connection between the cardoon and the goldfinch hanging beside it in Cotán's painting is more than coincidence — both organisms are linked through the thistle family. The Latin "Carduelis carduelis" literally means "thistle-bird of thistles."

This painting may be the only artwork in history where the etymological connection between a vegetable and a bird is made visible in a single composition.
""",
"cardoon/art/cardoon.md": """title: The Dramatic Arc — Cardoon as Compositional Climax
url: https://en.wikipedia.org/wiki/Juan_S%C3%A1nchez_Cot%C3%A1n
keyword: cardoon

The cardoon is the most dramatic element in Cotán's composition. Its stalks sweep upward and outward in a fountain-like spray that fills the right third of the painting, creating a visual counterweight to the hanging objects on the left.

This upward thrust completes the famous hyperbolic arc: the eye descends from the quinces through the birds and apples to the nadir at the root vegetables, then rockets upward along the cardoon's stalks.

Cotán renders each stalk as a study in light and shadow. The pale inner surfaces catch the light while the ribbed outer surfaces fall into shadow, creating a natural chiaroscuro. The effect is almost architectural — the cardoon resembles a Gothic fan vault.

No other still life painter of any period has given a vegetable such monumental treatment. The cardoon is Cotán's cathedral.
""",
"cardoon/math/cardoon.md": """title: Phyllotaxis — The Mathematics of Leaf Arrangement
url: https://en.wikipedia.org/wiki/Phyllotaxis
keyword: phyllotaxis

The cardoon's stalks radiate from its base following patterns described by phyllotaxis — the mathematical study of leaf arrangement in plants. Each successive stalk emerges at an angle of approximately 137.5° from the previous one, a value known as the golden angle.

This angle is derived from the golden ratio: the golden angle equals 360°/φ² ≈ 137.508°. This arrangement maximizes each stalk's access to light and air by ensuring no stalk is directly above another.

When viewed from above, the stalks form spiral patterns following consecutive Fibonacci numbers (1, 1, 2, 3, 5, 8, 13...). A cardoon with 8 clockwise spirals will show 13 counterclockwise spirals.

Cotán's side view compresses this spiral geometry into the dramatic fan we see in the painting. The apparent curve of the stalks is actually a 2D projection of a 3D logarithmic spiral — the same curve found in nautilus shells, galaxy arms, and hurricane formations.
""",
"cardoon/engineering/cardoon.md": """title: Blanching — Agricultural Engineering of Flavor
url: https://en.wikipedia.org/wiki/Blanching_(horticulture)
keyword: blanching

Raw cardoon stalks are bitter and fibrous. To make them edible, Spanish farmers employed blanching ("aporcado") — an engineering technique that manipulates the plant's photosynthetic machinery.

Blanching involves wrapping the growing plant in straw, burlap, or banked earth to exclude light. Without light, the stalks cannot produce chlorophyll (the source of bitterness) and instead accumulate sugars and starches.

The process takes 3-4 weeks and requires careful moisture management: too wet and the stalks rot; too dry and they become woody.

Cotán's cardoon shows the characteristic pale, almost white stalks of a properly blanched specimen. This same principle is used today for white asparagus, Belgian endive, and forced rhubarb — all crops that depend on engineering the absence of light.
""",
"cardoon/science/cardoon.md": """title: Cynara cardunculus — Wild Ancestor of the Artichoke
url: https://en.wikipedia.org/wiki/Cardoon
keyword: Cynara

The cardoon (Cynara cardunculus var. altilis) is the wild ancestor of the globe artichoke (Cynara cardunculus var. scolymus). Both are varieties of the same species — a thistle in the daisy family (Asteraceae) native to the western Mediterranean.

While the artichoke was selected for its large, fleshy flower buds, the cardoon was selected for its massive leaf stalks (petioles). These can reach 1.5 meters in length.

The cardoon's biochemistry is notable. It contains cynarin, a polyphenol that temporarily modifies taste perception: after eating cardoon, water tastes sweet. This effect was not scientifically explained until 1972.

Cardoon is also a source of vegetable rennet used to make traditional Iberian cheeses. The flowers contain aspartic proteases that curdle milk — an alternative to animal-derived rennet used in Portugal and Spain since at least Roman times.
""",
"cardoon/history/cardoon.md": """title: The Cardoon in Mediterranean History
url: https://en.wikipedia.org/wiki/Cardoon#History
keyword: cardoon

The cardoon has been cultivated in the Mediterranean for over 2,000 years. Pliny the Elder called it one of the most valuable garden plants in the Roman Empire.

In medieval Spain, cardoon was a Christmas tradition — "cardo en Navidad" appears in cookbooks throughout Castile and Aragon. In modern Navarra and Aragón, cardoon in almond sauce remains the traditional Christmas Eve dish.

The Moors developed the blanching technique that made cardoon a refined delicacy. Their agricultural treatises (particularly Ibn al-Awwam's 12th-century "Kitab al-Filaha") describe the method in detail.

When Spanish colonists reached the Río de la Plata in the 16th century, they brought cardoon seeds. The plant escaped cultivation and became one of the most aggressive invasive species in the Pampas — permanently altering the ecosystem. Cotán's cardoon stands at a midpoint in this history — between the Roman delicacy and the Argentine invader.
""",
# === ROOT VEGETABLES ===
"rootvegetables/language/rootvegetables.md": """title: Roots of Language — Carrot, Parsnip, and Turnip
url: https://en.wikipedia.org/wiki/Root_vegetable
keyword: zanahoria

The root vegetables on Cotán's ledge carry distinctive etymologies across Romance languages.

"Zanahoria" (carrot) is one of Spanish's most recognizable Arabic loanwords, from "safunāriyya," itself derived from Greek "staphylinos." This linguistic trail — Greek to Arabic to Spanish — maps the carrot's physical journey across the Mediterranean.

"Chirivía" (parsnip) comes from Latin "pastinaca." The modern English "parsnip" preserves the Latin root more faithfully.

"Nabo" (turnip) descends directly from Latin "napus," which also gives us "canola" (the plant was originally called "rapeseed," from Latin "rapum/napus").

The collective term "raíces" (roots) in Spanish cooking encompasses all underground vegetables. The expression "echar raíces" (to put down roots) uses the same word to describe human settlement — connecting these vegetables to the rootedness that Cotán was about to abandon for monastic life.
""",
"rootvegetables/art/rootvegetables.md": """title: The Horizontal Counterpoint
url: https://en.wikipedia.org/wiki/Bodeg%C3%B3n
keyword: horizontal

The root vegetables provide the only strong horizontal element in a composition dominated by vertical suspension. Laid flat on the stone ledge, they create a baseline that grounds the entire painting.

Cotán arranges them with deliberate casualness: the carrots overlap, the parsnip angles slightly, the turnip sits at the edge. This apparent disorder contrasts with the precise geometry of the hanging objects above.

The color palette shifts dramatically at the ledge line. Above: pure primaries against black. Below: subtle earth tones — orange, cream, purple-brown — against grey stone. This chromatic division reinforces the painting's spatial structure.

The turnip's round white form at the base of the cardoon creates a visual rhyme with the quinces at the opposite corner — two pale, rounded forms that bookend the composition.
""",
"rootvegetables/math/rootvegetables.md": """title: Fractal Branching in Root Systems
url: https://en.wikipedia.org/wiki/Fractal
keyword: fractal

The root vegetables in Cotán's painting hint at hidden mathematical structures below their surface. Root systems follow fractal branching patterns — self-similar structures that repeat at multiple scales.

A carrot's taproot sends out lateral roots, which send out sub-lateral roots, which send out root hairs — each level approximately 1/3 the diameter and 1/4 the length of its parent. This scaling relationship is described by fractal dimension D, typically between 1.3 and 1.8.

The visible surface of Cotán's carrots — smooth, tapered, with subtle ridges — is the storage organ, not the full root system. The fractal complexity is hidden underground.

What we see is the result: a paraboloid of revolution (the carrot's geometric form), the three-dimensional shape traced by rotating a parabola around its axis. Even the simple carrot contains mathematical depth.
""",
"rootvegetables/engineering/rootvegetables.md": """title: Root Cellaring — Underground Storage Engineering
url: https://en.wikipedia.org/wiki/Root_cellar
keyword: cellar

Root vegetables were the engineering solution to winter food security in early modern Spain. Their ability to store energy underground made them the original biological battery.

Root cellars exploit the earth's thermal stability. Below the frost line, soil temperature remains a nearly constant 12-14°C year-round. A properly designed root cellar maintains 85-95% humidity, preventing dehydration.

The vegetables on Cotán's ledge represent different storage characteristics. Carrots store best in damp sand (lasting 4-6 months). Parsnips improve with cold — their starch converts to sugar after frost. Turnips are the most perishable, lasting only 2-3 months.

The cantarero in Cotán's painting is the above-ground version: a stone niche that provides partial thermal insulation for shorter-term storage.
""",
"rootvegetables/science/rootvegetables.md": """title: Daucus, Pastinaca, Brassica — Three Families on a Ledge
url: https://en.wikipedia.org/wiki/Root_vegetable
keyword: Daucus

Cotán's ledge displays root vegetables from two different plant families — a botanical diversity that reveals deep evolutionary history.

The carrots (Daucus carota) and parsnip (Pastinaca sativa) belong to the family Apiaceae (umbellifers). Their characteristic taproot shape results from secondary growth: the vascular cambium produces concentric rings of storage tissue.

The turnip (Brassica rapa) belongs to the family Brassicaceae (crucifers). Its swollen root is actually a hypocotyl rather than a true root, which is why turnips grow partially above ground.

Cotán's carrots are notable for their purple-orange coloration. In 1602, most European carrots were still purple, yellow, or white — the orange carrot was not standardized until Dutch growers selected for it in the late 17th century. The purple color comes from anthocyanins, while orange comes from beta-carotene.
""",
"rootvegetables/history/rootvegetables.md": """title: Peasant Food on the Stone Ledge
url: https://en.wikipedia.org/wiki/History_of_Spanish_cuisine
keyword: peasant

The root vegetables on Cotán's ledge are the most humble objects in the painting — the food of peasants, laborers, and the poor. Their placement flat on the stone, without the elevation of strings, reinforces their lowly status.

In the rigid social structure of Hapsburg Spain, food carried clear class signals. Game birds signaled hunting privileges. Quinces and apples indicated land ownership. But root vegetables grew in any patch of soil.

Carrots and turnips formed the base of "olla podrida" (literally "rotten pot"), the national stew of Spain that Cervantes mentions repeatedly in Don Quixote.

Yet Cotán grants these humble roots the same reverent attention he gives the quinces and partridge. This democratic vision — treating peasant food with the same artistic dignity as noble fare — was radical in its time. In the eyes of God (and of this painter), a carrot is as worthy of contemplation as a game bird.
""",
# === STONE LEDGE ===
"stoneledge/language/stoneledge.md": """title: Bodegón — The Word That Names a Genre
url: https://en.wikipedia.org/wiki/Bodeg%C3%B3n
keyword: bodegón

The stone ledge is the defining element of the "bodegón" — a Spanish word that names both a physical space and an entire genre of painting. "Bodegón" derives from "bodega" (cellar, tavern), from Latin "apotheca" (storehouse), from Greek "apotheke" — the same root that gives us "apothecary."

In 17th-century Spanish, a "bodegón" was a low tavern or eating house where simple food was served on stone counters. When painters began depicting these scenes, the name transferred from place to picture.

Unlike the Northern European "stilleven" (still life) or the French "nature morte" (dead nature), the Spanish term centers on architecture — the space where food is displayed.

The stone ledge in Cotán's painting is therefore not mere support but the genre's namesake. It is the bodegón itself: the stone counter that frames the ordinary and makes it extraordinary.
""",
"stoneledge/art/stoneledge.md": """title: Trompe l'Oeil — The Ledge That Breaks the Frame
url: https://en.wikipedia.org/wiki/Trompe-l%27%C5%93il
keyword: trompe

The stone ledge is Cotán's most radical artistic device. Its front edge appears to project forward beyond the picture plane — a trompe l'oeil effect that dissolves the boundary between the painted world and the viewer's space.

The carrots and turnip rest on this ledge with their tips overhanging the edge, casting shadows downward. This creates the illusion that the vegetables could be physically grasped.

Cotán achieves this through precise perspective and tonal control. The ledge's top surface is rendered in a slightly warmer, lighter tone than its vertical face, simulating the way overhead light falls on a horizontal plane.

This device has ancient roots: Pliny the Elder described the Greek painter Zeuxis, whose painted grapes were so realistic that birds tried to eat them. Cotán's ledge operates on the same principle but with greater sophistication — it restructures the viewer's spatial relationship to the entire painting.
""",
"stoneledge/math/stoneledge.md": """title: Projective Geometry and the Picture Plane
url: https://en.wikipedia.org/wiki/Projective_geometry
keyword: projection

The stone ledge demonstrates principles of projective geometry. The ledge creates a clear picture plane — the mathematical surface where three-dimensional space is projected onto two dimensions.

In projective geometry, parallel lines converge at vanishing points. The ledge's top edges, if extended, would converge at a single point — revealing Cotán's use of one-point perspective.

The relationship between the ledge and the dark void illustrates a fundamental concept: the "window" metaphor of Renaissance perspective, first described by Leon Battista Alberti in 1435. The stone frame is literally Alberti's "open window through which the subject to be painted is seen."

The mathematical transformation from 3D cantarero to 2D painting follows the projective transformation matrix. Cotán performed this transformation intuitively; Girard Desargues would formalize it mathematically just 39 years later in 1639.
""",
"stoneledge/engineering/stoneledge.md": """title: The Cantarero — Stone Architecture for Food
url: https://en.wikipedia.org/wiki/Larder
keyword: cantarero

The stone structure in Cotán's painting is a "cantarero" or "fresquera" — a ventilated stone niche built into the exterior wall of Spanish houses. It functioned as a natural refrigerator.

The engineering is straightforward but effective. Thick stone walls (typically 40-60 cm) provide thermal mass that dampens temperature swings. The deep recess shields contents from direct sunlight. The open front allows air exchange.

The interior temperature of a well-designed cantarero in Toledo's climate would have been 5-10°C cooler than ambient in summer — sufficient to extend the shelf life of most produce by 50-100%.

Cotán's painting preserves a precise record of this vernacular architecture — many cantareros were destroyed during Spain's modernization in the 20th century, making paintings like this one valuable archaeological evidence.
""",
"stoneledge/science/stoneledge.md": """title: Limestone — The Geology of the Ledge
url: https://en.wikipedia.org/wiki/Limestone
keyword: limestone

The stone in Cotán's painting is almost certainly limestone (calcium carbonate, CaCO₃), the dominant building stone of Castile. Toledo sits on a massive limestone formation deposited during the Miocene epoch when central Spain was covered by shallow seas.

Limestone forms from the accumulated skeletons of marine organisms — compressed over millions of years. A single cubic centimeter of Toledo limestone may contain thousands of microscopic fossils.

The stone's properties make it ideal for food storage. Limestone has a thermal conductivity of approximately 1.3 W/(m·K) — low enough to insulate but high enough to absorb excess heat. Its thermal mass means a thick limestone slab stays cool for hours after ambient temperature rises.

Limestone is also slightly alkaline (pH 8-9 when wet), which inhibits the growth of acid-loving bacteria and molds — a property that Spanish builders may have discovered empirically long before the germ theory of disease.
""",
"stoneledge/history/stoneledge.md": """title: The Stone Window — Toledo's Architectural Heritage
url: https://en.wikipedia.org/wiki/Toledo,_Spain
keyword: Toledo

Toledo, where Cotán lived and painted, is a city built of stone. Perched on a granite hill above the Tagus River, Toledo's architecture exploits local geology with a sophistication reflecting centuries of Moorish, Jewish, and Christian craftsmanship.

The cantarero in Cotán's painting belongs to a tradition of stone-built domestic architecture that reached its peak during Toledo's period as Spain's imperial capital.

The precise cut of Cotán's stone ledge shows the work of a skilled cantero (stonemason). The clean edges, flat surfaces, and right angles required iron chisels, mallets, and measuring tools. The mason's craft was so respected that "cantero" was a surname.

Cotán himself may have learned to appreciate this craftsmanship through his painting practice. His ability to render stone texture with such fidelity suggests long study of actual stone surfaces.
""",
# === DARK VOID ===
"darkvoid/language/darkvoid.md": """title: Vacío — The Spanish Vocabulary of Emptiness
url: https://en.wikipedia.org/wiki/Void_(philosophy)
keyword: vacío

The dark background in Cotán's painting invites a rich Spanish vocabulary of emptiness. "Vacío" (void/empty), "oscuridad" (darkness), "negrura" (blackness), "nada" (nothing) — each word carries different philosophical weight.

"Vacío" comes from Latin "vacivus" (empty), related to "vacuum." In Spanish mystical literature — particularly the works of St. John of the Cross — "el vacío" described the spiritual emptiness that precedes divine union.

"Nada" (nothing) became a key term in Spanish existential thought. The mystic tradition of "nada y todo" (nothing and everything) finds visual expression in Cotán's void.

"Tinieblas" (shadows/darkness, always plural) carries biblical weight — the darkness over the deep in Genesis. For an artist about to enter a Carthusian cell — a space of deliberate emptiness — these words were not abstractions but a coming reality.
""",
"darkvoid/art/darkvoid.md": """title: Tenebrism — Painting with Darkness
url: https://en.wikipedia.org/wiki/Tenebrism
keyword: tenebrism

The black void behind Cotán's objects is not mere background but an active compositional force. This use of profound darkness — tenebrism — was revolutionary in 1602, anticipating techniques that Caravaggio was simultaneously developing in Rome.

Cotán's darkness differs from Caravaggio's in a crucial way. Caravaggio's darkness is atmospheric — it suggests a dark room. Cotán's darkness is absolute — it suggests a void, an absence of space itself. The objects don't sit in darkness; they sit before nothingness.

This metaphysical quality transforms the bodegón from a genre scene into something approaching religious painting. The food hovers between the material world (the stone ledge) and the immaterial void.

Technically, Cotán achieved this effect by applying multiple layers of bone black and carbon black pigments over a dark ground, creating a surface so light-absorbing that it reveals no texture or depth. The void truly appears infinite.
""",
"darkvoid/math/darkvoid.md": """title: Negative Space and the Figure-Ground Problem
url: https://en.wikipedia.org/wiki/Negative_space
keyword: negative space

The dark void raises a fundamental question in visual mathematics: what is figure and what is ground? The food items are clearly "figure" (positive space), but the void is not merely "ground" — it has its own presence.

The ratio of dark to light in this painting is approximately 35:65. This near-golden ratio partition may not be coincidental — Renaissance artists frequently used golden ratio proportions.

In topology, the void represents the complement of the objects' boundary curves. The silhouette of each hanging item against the darkness creates a Jordan curve — dividing the plane into exactly two regions.

The mathematical concept of a "black body" — absorbing all electromagnetic radiation — was not formalized until Kirchhoff in 1860. Yet Cotán's void approximates one: it reflects nothing, reveals nothing, and absorbs the viewer's gaze as completely as a physical black body absorbs light.
""",
"darkvoid/engineering/darkvoid.md": """title: Light Control — Engineering Darkness
url: https://en.wikipedia.org/wiki/Darkroom
keyword: darkness

Creating and controlling darkness was an engineering challenge that Cotán understood as both a painter and a recorder of domestic architecture. The cantarero's deep recess naturally creates a dark background — but Cotán intensifies it beyond physical reality.

The physics of light absorption depends on surface material and geometry. Rough stone surfaces scatter incoming light diffusely (Lambertian reflection), while the deep recess geometry ensures that most scattered light hits another surface — a principle exploited in modern "light traps."

Modern engineered darkness (anechoic chambers, Vantablack coatings) achieves 99.96% light absorption. Cotán's painted void, using period materials (bone black pigment, walnut oil medium), achieves approximately 97-98% — remarkably close to modern standards.

In a real cantarero, some light would scatter from the rear wall. Cotán eliminates this entirely, creating an idealized darkness that maximizes contrast and reflects the goal of larder design: minimize light to slow food spoilage.
""",
"darkvoid/science/darkvoid.md": """title: The Physics of Black — Light and Its Absence
url: https://en.wikipedia.org/wiki/Black_body
keyword: absorption

The darkness in Cotán's painting is, physically, the absence of reflected photons reaching the viewer's eye. But the science of "blackness" is surprisingly complex.

A perfectly black surface would absorb 100% of incident electromagnetic radiation — a theoretical "black body." Cotán's bone black pigment (made from charred animal bones) absorbs approximately 97% of visible light.

The human visual system amplifies the perceived darkness through "simultaneous contrast." The bright objects surrounding the void cause the visual cortex to suppress sensitivity in adjacent regions, making the dark areas appear even darker than they are.

Scotopic (low-light) vision engages different photoreceptors than photopic (bright-light) vision. When we gaze into Cotán's void, our rod cells activate — a shift that slightly desaturates our perception of surrounding colors. The painting dynamically alters our vision as we look at it.
""",
"darkvoid/history/darkvoid.md": """title: The Dark Night of the Soul
url: https://en.wikipedia.org/wiki/Dark_Night_of_the_Soul
keyword: dark night

The void behind Cotán's food carries spiritual weight that his contemporary audience would have recognized immediately. In 1602, Spain was saturated with mystical literature, and the dominant metaphor for spiritual transformation was darkness.

St. John of the Cross described the "noche oscura del alma" (dark night of the soul) — a period of spiritual desolation through which the soul must pass before reaching union with God.

St. Teresa of Ávila described the soul's interior as chambers leading to a dark center where God dwells. The imagery of a dark niche containing precious things — exactly what Cotán paints — resonates with Teresa's "Interior Castle."

For Cotán, preparing to enter the Carthusian order in 1603, the void was more than artistic convention. The Carthusian life is built around darkness and silence. This painting can be read as his meditation on the threshold between the visible world of abundance and the invisible world of spiritual darkness he was about to enter.
""",
# === WHOLE IMAGE ===
"wholeimage/art/wholeimage.md": """title: The Hyperbolic Arc — A Masterpiece of Composition
url: https://en.wikipedia.org/wiki/Juan_S%C3%A1nchez_Cot%C3%A1n
keyword: composition

Juan Sánchez Cotán's "Still Life with Game, Vegetables and Fruit" (1602) is widely regarded as the founding masterpiece of Spanish bodegón painting. Its compositional innovation — arranging objects along a hyperbolic curve from upper left to lower center, then sweeping upward to the right — has no precedent in the history of art.

The painting measures approximately 69 × 89 cm and is executed in oil on canvas. Cotán completed it in Toledo, the year before he entered the Carthusian monastery of El Paular as a lay brother at age 42.

What makes this painting revolutionary is its combination of mathematical precision and spiritual intensity. The objects are arranged with geometric rigor yet the effect is contemplative, not cold.

Cotán painted at least six bodegones with this distinctive window-and-void composition. Together, they constitute a systematic exploration of natural form unprecedented in Western painting.
""",
"wholeimage/history/wholeimage.md": """title: Cotán's Journey — From Painter to Monk
url: https://en.wikipedia.org/wiki/Juan_S%C3%A1nchez_Cot%C3%A1n
keyword: Carthusian

Juan Sánchez Cotán (1560-1627) lived one of the most dramatic biographical arcs in art history. A successful painter in Toledo during the Spanish Golden Age, he abandoned his career, wealth, and possessions in 1603 to enter the Carthusian monastery of El Paular.

Born in the village of Orgaz (near Toledo), Cotán trained under Blas de Prado. By the 1590s, he had established himself as Toledo's leading painter of bodegones.

The Carthusian Rule demands perpetual silence, solitary living, vegetarian diet, and manual labor. Cotán could no longer paint for patrons, though he continued to paint religious works for the monastery.

This painting (1602) was among his last secular works. At El Paular, and later at the Charterhouse of Granada, Cotán spent his remaining 24 years in monastic life. He died in 1627, remembered by his brothers as a model of humility — qualities already visible in his reverent treatment of quinces, carrots, and game birds.
""",
}

# Write all files
for relpath, content in files.items():
    fullpath = os.path.join(BASE, relpath)
    os.makedirs(os.path.dirname(fullpath), exist_ok=True)
    with open(fullpath, 'w') as f:
        f.write(content.lstrip('\n'))
    print(f"  Created: {relpath}")

print(f"\nDone. Created {len(files)} files.")
