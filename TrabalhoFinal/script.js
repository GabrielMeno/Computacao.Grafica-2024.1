// globalConfig.js
// ============================================================================
// ============================================================================

// Fornece variáveis ​​globais usadas por todo o programa.


// Timing multiplier for entire game engine.
let gameSpeed = 1;

// Colors
const BLUE =   { r: 0x80, g: 0x80, b: 0xff }; 
const GREEN =  { r: 0x80, g: 0xff, b: 0x80 };
const PINK =   { r: 0xff, g: 0xe0, b: 0xe6 }; 
const ORANGE = { r: 0xff, g: 0xd7, b: 0x80 }; 
const allColors = [BLUE, GREEN, PINK, ORANGE];

// Gameplay
const getSpawnDelay = () => {
	const spawnDelayMax = 1400;
	const spawnDelayMin = 550;
	const spawnDelay = spawnDelayMax - state.game.cubeCount * 3.1;
	return Math.max(spawnDelay, spawnDelayMin);
}
const doubleStrongEnableScore = 2000;
// Número de cubos que devem ser destruídos antes de ativar uma função.
const slowmoThreshold = 10;
const strongThreshold = 25;
const spinnerThreshold = 25;

// Estado de interação
let pointerIsDown = false;
// A última posição conhecida do ponteiro primário em coordenadas de tela.
let pointerScreen = { x: 0, y: 0 };
// Igual a `pointerScreen`, mas convertida para coordenadas da cena em rAF.
let pointerScene = { x: 0, y: 0 };
// Velocidade mínima do ponteiro antes que os "acertos" sejam contados.
const minPointerSpeed = 60;
// A velocidade do acerto afeta a direção do alvo após o acerto. Este número atenua essa força.
const hitDampening = 0.1;
// O painel de fundo recebe sombras e é a posição Z negativa mais distante das entidades.
const backboardZ = -400;
const shadowColor = '#262e36';
// Quanto arrasto do ar é aplicado a objetos padrão.
const airDrag = 0.022;
const gravity = 0.3;
// Configuração de faísca
const sparkColor = 'rgba(170,221,255,.9)';
const sparkThickness = 2.2;
const airDragSpark = 0.1;
// Rastrear posições do ponteiro para mostrar o rastro
const touchTrailColor = 'rgba(170,221,255,.62)';
const touchTrailThickness = 7;
const touchPointLife = 120;
const touchPoints = [];
// Tamanho dos alvos no jogo. Isso afeta o tamanho renderizado e a área de acerto.
const targetRadius = 40;
const targetHitRadius = 50;
const makeTargetGlueColor = target => {
	// const alpha = (target.health - 1) / (target.maxHealth - 1);
	// return `rgba(170,221,255,${alpha.toFixed(3)})`;
	return 'rgb(170,221,255)';
};
// Tamanho dos fragmentos do alvo
const fragRadius = targetRadius / 3;




// Elemento do canvas do jogo necessário em setup.js e interaction.js
const canvas = document.querySelector('#c');

// Configuração da câmera 3D
// Afeta a perspectiva
const cameraDistance = 900;
// Não afeta a perspectiva
const sceneScale = 1;
// Objetos que chegam muito perto da câmera serão desbotados para transparente nessa faixa.
// const cameraFadeStartZ = 0.8*cameraDistance - 6*targetRadius;
const cameraFadeStartZ = 0.45*cameraDistance;
const cameraFadeEndZ = 0.65*cameraDistance;
const cameraFadeRange = cameraFadeEndZ - cameraFadeStartZ;

// Globais usadas para acumular todos os vértices/polígonos em cada frame
const allVertices = [];
const allPolys = [];
const allShadowVertices = [];
const allShadowPolys = [];




// state.js
// ============================================================================
// ============================================================================

///////////
// Enums //
///////////

// Modos de Jogo
const GAME_MODE_RANKED = Symbol('GAME_MODE_RANKED');
const GAME_MODE_CASUAL = Symbol('GAME_MODE_CASUAL');

// Menus Disponíveis
const MENU_MAIN = Symbol('MENU_MAIN');
const MENU_PAUSE = Symbol('MENU_PAUSE');
const MENU_SCORE = Symbol('MENU_SCORE');



//////////////////
// Estado Global //
//////////////////

const state = {
	game: {
		mode: GAME_MODE_RANKED,
		// Tempo de execução do jogo atual.
		time: 0,
		// Pontuação do jogador.
		score: 0,
		// Número total de cubos destruídos no jogo.
		cubeCount: 0
	},
	menus: {
		// Defina como `null` para ocultar todos os menus
		active: MENU_MAIN
	}
};


////////////////////////////
// Seletores de Estado Global //
////////////////////////////

const isInGame = () => !state.menus.active;
const isMenuVisible = () => !!state.menus.active;
const isCasualGame = () => state.game.mode === GAME_MODE_CASUAL;
const isPaused = () => state.menus.active === MENU_PAUSE;


///////////////////
// Armazenamento Local //
///////////////////

const highScoreKey = '__menja__highScore';
const getHighScore = () => {
	const raw = localStorage.getItem(highScoreKey);
	return raw ? parseInt(raw, 10) : 0;
};

let _lastHighscore = getHighScore();
const setHighScore = score => {
	_lastHighscore = getHighScore();
	localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () => state.game.score > _lastHighscore;




// utils.js
// ============================================================================
// ============================================================================


const invariant = (condition, message) => {
	if (!condition) throw new Error(message);
};


/////////
// DOM //
/////////

const $ = selector => document.querySelector(selector);
const handleClick = (element, handler) => element.addEventListener('click', handler);
const handlePointerDown = (element, handler) => {
	element.addEventListener('touchstart', handler);
	element.addEventListener('mousedown', handler);
};




////////////////////////
// Auxiliares de Formatação //
////////////////////////

// Converte um número em uma string formatada com separadores de milhar.
const formatNumber = num => num.toLocaleString();



////////////////////
// Constantes Matemáticas //
////////////////////

const PI = Math.PI;
const TAU = Math.PI * 2;
const ETA = Math.PI * 0.5;



//////////////////
// Auxiliares Matemáticos //
//////////////////

// Restringe um número entre valores mínimos e máximos (inclusive)
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Interpola linearmente entre os números a e b por uma quantidade específica.
// mix >= 0 && mix <= 1
const lerp = (a, b, mix) => (b - a) * mix + a;




////////////////////
// Auxiliares de Aleatoriedade //
////////////////////

// Gera um número aleatório entre min (inclusivo) e max (exclusivo)
const random = (min, max) => Math.random() * (max - min) + min;

// Gera um número inteiro aleatório entre e possivelmente incluindo valores min e max
const randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

// Retorna um elemento aleatório de um array
const pickOne = arr => arr[Math.random() * arr.length | 0];




///////////////////
// Auxiliares de Cor //
///////////////////

// Converte um objeto de cor { r, g, b } para um código hexadecimal de 6 dígitos.
const colorToHex = color => {
	return '#' +
		(color.r | 0).toString(16).padStart(2, '0') +
		(color.g | 0).toString(16).padStart(2, '0') +
		(color.b | 0).toString(16).padStart(2, '0');
};

// Opera em um objeto de cor { r, g, b }.
// Retorna um código hexadecimal de string.
// `lightness` deve variar de 0 a 1. 0 é preto puro, 1 é branco puro.
const shadeColor = (color, lightness) => {
	let other, mix;
	if (lightness < 0.5) {
		other = 0;
		mix = 1 - (lightness * 2);
	} else {
		other = 255;
		mix = lightness * 2 - 1;
	}
	return '#' +
		(lerp(color.r, other, mix) | 0).toString(16).padStart(2, '0') +
		(lerp(color.g, other, mix) | 0).toString(16).padStart(2, '0') +
		(lerp(color.b, other, mix) | 0).toString(16).padStart(2, '0');
};





////////////////////
// Auxiliares de Temporização //
////////////////////

const _allCooldowns = [];

const makeCooldown = (rechargeTime, units=1) => {
	let timeRemaining = 0;
	let lastTime = 0;

	const initialOptions = { rechargeTime, units };

	const updateTime = () => {
		const now = state.game.time;
		// Redefine o tempo restante se o tempo retroceder.
		if (now < lastTime) {
			timeRemaining = 0;
		} else {
			// atualizar...
			timeRemaining -= now - lastTime;
			if (timeRemaining < 0) timeRemaining = 0;
		}
		lastTime = now;
	};

	const canUse = () => {
		updateTime();
		return timeRemaining <= (rechargeTime * (units - 1));
	};

	const cooldown = {
		canUse,
		useIfAble() {
			const usable = canUse();
			if (usable) timeRemaining += rechargeTime;
			return usable;
		},
		mutate(options) {
			if (options.rechargeTime) {
				// Aplica delta de tempo de recarga para que a alteração tenha efeito imediato.
				timeRemaining -= rechargeTime - options.rechargeTime;
				if (timeRemaining < 0) timeRemaining = 0;
				rechargeTime = options.rechargeTime;
			}
			if (options.units) units = options.units;
		},
		reset() {
			timeRemaining = 0;
			lastTime = 0;
			this.mutate(initialOptions);
		}
	};

	_allCooldowns.push(cooldown);

	return cooldown;
};

const resetAllCooldowns = () => _allCooldowns.forEach(cooldown => cooldown.reset());

const makeSpawner = ({ chance, cooldownPerSpawn, maxSpawns }) => {
	const cooldown = makeCooldown(cooldownPerSpawn, maxSpawns);
	return {
		shouldSpawn() {
			return Math.random() <= chance && cooldown.useIfAble();
		},
		mutate(options) {
			if (options.chance) chance = options.chance;
			cooldown.mutate({
				rechargeTime: options.cooldownPerSpawn,
				units: options.maxSpawns
			});
		}
	};
};




////////////////////
// Auxiliares de Vetor //
////////////////////

const normalize = v => {
	const mag = Math.hypot(v.x, v.y, v.z);
	return {
		x: v.x / mag,
		y: v.y / mag,
		z: v.z / mag
	};
}

// Auxiliares matemáticos curried
const add = a => b => a + b;
// Auxiliares de vetor curried
const scaleVector = scale => vector => {
	vector.x *= scale;
	vector.y *= scale;
	vector.z *= scale;
};









////////////////
// Auxiliares 3D //
////////////////

// Clonar array e todos os vértices.
function cloneVertices(vertices) {
	return vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
}

// Copiar dados de vértice de um array para outro.
// Os arrays devem ter o mesmo comprimento.
function copyVerticesTo(arr1, arr2) {
	const len = arr1.length;
	for (let i = 0; i < len; i++) {
		const v1 = arr1[i];
		const v2 = arr2[i];
		v2.x = v1.x;
		v2.y = v1.y;
		v2.z = v1.z;
	}
}

// Calcular ponto médio do triângulo.
// Altera a propriedade `middle` do `poly` fornecido.
function computeTriMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x) / 3;
	poly.middle.y = (v[0].y + v[1].y + v[2].y) / 3;
	poly.middle.z = (v[0].z + v[1].z + v[2].z) / 3;
}

// Calcular ponto médio do quadrilátero.
// Altera a propriedade `middle` do `poly` fornecido.
function computeQuadMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x + v[3].x) / 4;
	poly.middle.y = (v[0].y + v[1].y + v[2].y + v[3].y) / 4;
	poly.middle.z = (v[0].z + v[1].z + v[2].z + v[3].z) / 4;
}

function computePolyMiddle(poly) {
	if (poly.vertices.length === 3) {
		computeTriMiddle(poly);
	} else {
		computeQuadMiddle(poly);
	}
}

// Calcular distância do ponto médio de qualquer polígono (tri ou quad) até a câmera.
// Define a propriedade `depth` do `poly` fornecido.
// Também aciona o cálculo do ponto médio, que altera a propriedade `middle` de `poly`.
function computePolyDepth(poly) {
	computePolyMiddle(poly);
	const dX = poly.middle.x;
	const dY = poly.middle.y;
	const dZ = poly.middle.z - cameraDistance;
	poly.depth = Math.hypot(dX, dY, dZ);
}

// Calcular normal de qualquer polígono. Usa produto vetorial normalizado.
// Altera a propriedade `normalName` do `poly` fornecido.
function computePolyNormal(poly, normalName) {
	// Armazenar referências rápidas para os vértices
	const v1 = poly.vertices[0];
	const v2 = poly.vertices[1];
	const v3 = poly.vertices[2];
	// Calcular diferença dos vértices, seguindo a ordem de enrolamento.
	const ax = v1.x - v2.x;
	const ay = v1.y - v2.y;
	const az = v1.z - v2.z;
	const bx = v1.x - v3.x;
	const by = v1.y - v3.y;
	const bz = v1.z - v3.z;
	// Produto vetorial
	const nx = ay * bz - az * by;
	const ny = az * bx - ax * bz;
	const nz = ax * by - ay * bx;
	// Calcular magnitude da normal e normalizar
	const mag = Math.hypot(nx, ny, nz);
	const polyNormal = poly[normalName];
	polyNormal.x = nx / mag;
	polyNormal.y = ny / mag;
	polyNormal.z = nz / mag;
}

// Aplicar translação/rotação/escala a todos os vértices fornecidos.
// Se `vertices` e `target` forem o mesmo array, os vértices serão alterados no lugar.
// Se `vertices` e `target` forem arrays diferentes, `vertices` não serão alterados, em vez disso, os
// valores transformados de `vertices` serão escritos no array `target`.
function transformVertices(vertices, target, tX, tY, tZ, rX, rY, rZ, sX, sY, sZ) {
	// Constantes de multiplicação de matriz precisam ser calculadas apenas uma vez para todos os vértices.
	const sinX = Math.sin(rX);
	const cosX = Math.cos(rX);
	const sinY = Math.sin(rY);
	const cosY = Math.cos(rY);
	const sinZ = Math.sin(rZ);
	const cosZ = Math.cos(rZ);

	// Usando forEach() como map(), mas com um array de destino (reutilizado).
	vertices.forEach((v, i) => {
		const targetVertex = target[i];
		// Rotação no eixo X
		const x1 = v.x;
		const y1 = v.z * sinX + v.y * cosX;
		const z1 = v.z * cosX - v.y * sinX;
		// Rotação no eixo Y
		const x2 = x1 * cosY - z1 * sinY;
		const y2 = y1;
		const z2 = x1 * sinY + z1 * cosY;
		// Rotação no eixo Z
		const x3 = x2 * cosZ - y2 * sinZ;
		const y3 = x2 * sinZ + y2 * cosZ;
		const z3 = z2;

		// Escala, Translação e define a transformação.
		targetVertex.x = x3 * sX + tX;
		targetVertex.y = y3 * sY + tY;
		targetVertex.z = z3 * sZ + tZ;
	});
}

// Projeção 3D em um único vértice.
// Altera diretamente o vértice.
const projectVertex = v => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	v.x = v.x * depth;
	v.y = v.y * depth;
};

// Projeção 3D em um único vértice.
// Altera um vértice de destino secundário.
const projectVertexTo = (v, target) => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	target.x = v.x * depth;
	target.y = v.y * depth;
};





// PERF.js
// ============================================================================
// ============================================================================

// Funções dummy no-op.
// Eu uso essas em uma construção especial para perfil de desempenho personalizado.
const PERF_START = () => {};
const PERF_END = () => {};
const PERF_UPDATE = () => {};




// 3dModels.js
// ============================================================================
// ============================================================================

// Definir modelos uma vez. A origem é o centro do modelo.

// Um cubo simples, 8 vértices, 6 quadriláteros.
// O padrão é um comprimento de borda de 2 unidades, pode ser influenciado com `scale`.
function makeCubeModel({ scale = 1 }) {
	return {
		vertices: [
			// topo
			{ x: -scale, y: -scale, z: scale },
			{ x: scale, y: -scale, z: scale },
			{ x: scale, y: scale, z: scale },
			{ x: -scale, y: scale, z: scale },
			// fundo
			{ x: -scale, y: -scale, z: -scale },
			{ x: scale, y: -scale, z: -scale },
			{ x: scale, y: scale, z: -scale },
			{ x: -scale, y: scale, z: -scale }
		],
		polys: [
			// z = 1
			{ vIndexes: [0, 1, 2, 3] },
			// z = -1
			{ vIndexes: [7, 6, 5, 4] },
			// y = 1
			{ vIndexes: [3, 2, 6, 7] },
			// y = -1
			{ vIndexes: [4, 5, 1, 0] },
			// x = 1
			{ vIndexes: [5, 6, 2, 1] },
			// x = -1
			{ vIndexes: [0, 3, 7, 4] }
		]
	};
}

// Não muito otimizado - muitos vértices duplicados são gerados.
function makeRecursiveCubeModel({ recursionLevel, splitFn, color, scale = 1 }) {
	const getScaleAtLevel = level => 1 / (3 ** level);

	// Podemos modelar o nível 0 manualmente. É apenas um único cubo centralizado.
	let cubeOrigins = [{ x: 0, y: 0, z: 0 }];

	// Substituir recursivamente cubos por cubos menores.
	for (let i = 1; i <= recursionLevel; i++) {
		const scale = getScaleAtLevel(i) * 2;
		const cubeOrigins2 = [];
		cubeOrigins.forEach(origin => {
			cubeOrigins2.push(...splitFn(origin, scale));
		});
		cubeOrigins = cubeOrigins2;
	}

	const finalModel = { vertices: [], polys: [] };

	// Gerar modelo de cubo único e escalá-lo.
	const cubeModel = makeCubeModel({ scale: 1 });
	cubeModel.vertices.forEach(scaleVector(getScaleAtLevel(recursionLevel)));

	// Calcular a distância máxima dos valores de origem x, y ou z.
	// Mesmo resultado que `Math.max(...cubeOrigins.map(o => o.x))`, mas muito mais rápido.
	const maxComponent = getScaleAtLevel(recursionLevel) * (3 ** recursionLevel - 1);

	// Colocar geometria do cubo em cada origem.
	cubeOrigins.forEach((origin, cubeIndex) => {
		// Para calcular oclusão (sombreamento), encontrar o componente de origem com maior
		// magnitude e normalizá-lo em relação a `maxComponent`.
		const occlusion = Math.max(
			Math.abs(origin.x),
			Math.abs(origin.y),
			Math.abs(origin.z)
		) / maxComponent;
		// Em iterações mais baixas, a oclusão parece melhor se for clareada um pouco.
		const occlusionLighter = recursionLevel > 2
			? occlusion
			: (occlusion + 0.8) / 1.8;
		// Clonar, transladar vértices para a origem e aplicar escala
		finalModel.vertices.push(
			...cubeModel.vertices.map(v => ({
				x: (v.x + origin.x) * scale,
				y: (v.y + origin.y) * scale,
				z: (v.z + origin.z) * scale
			}))
		);
		// Clonar polígonos, deslocar índices de vértice referenciados e calcular cor.
		finalModel.polys.push(
			...cubeModel.polys.map(poly => ({
				vIndexes: poly.vIndexes.map(add(cubeIndex * 8))
			}))
		);
	});

	return finalModel;
}



// o: Vector3D - Posição da origem do cubo (centro).
// s: Vector3D - Determina o tamanho da esponja de Menger.
function mengerSpongeSplit(o, s) {
	return [
		// Topo
		{ x: o.x + s, y: o.y - s, z: o.z + s },
		{ x: o.x + s, y: o.y - s, z: o.z + 0 },
		{ x: o.x + s, y: o.y - s, z: o.z - s },
		{ x: o.x + 0, y: o.y - s, z: o.z + s },
		{ x: o.x + 0, y: o.y - s, z: o.z - s },
		{ x: o.x - s, y: o.y - s, z: o.z + s },
		{ x: o.x - s, y: o.y - s, z: o.z + 0 },
		{ x: o.x - s, y: o.y - s, z: o.z - s },
		// Fundo
		{ x: o.x + s, y: o.y + s, z: o.z + s },
		{ x: o.x + s, y: o.y + s, z: o.z + 0 },
		{ x: o.x + s, y: o.y + s, z: o.z - s },
		{ x: o.x + 0, y: o.y + s, z: o.z + s },
		{ x: o.x + 0, y: o.y + s, z: o.z - s },
		{ x: o.x - s, y: o.y + s, z: o.z + s },
		{ x: o.x - s, y: o.y + s, z: o.z + 0 },
		{ x: o.x - s, y: o.y + s, z: o.z - s },
		// Meio
		{ x: o.x + s, y: o.y + 0, z: o.z + s },
		{ x: o.x + s, y: o.y + 0, z: o.z - s },
		{ x: o.x - s, y: o.y + 0, z: o.z + s },
		{ x: o.x - s, y: o.y + 0, z: o.z - s }
	];
}

// Auxiliar para otimizar modelos, mesclando vértices duplicados dentro de um limite,
// e removendo todos os polígonos que compartilham os mesmos vértices.
// Altera diretamente o modelo.
function optimizeModel(model, threshold=0.0001) {
	const { vertices, polys } = model;

	const compareVertices = (v1, v2) => (
		Math.abs(v1.x - v2.x) < threshold &&
		Math.abs(v1.y - v2.y) < threshold &&
		Math.abs(v1.z - v2.z) < threshold
	);

	const comparePolys = (p1, p2) => {
		const v1 = p1.vIndexes;
		const v2 = p2.vIndexes;
		return (
			(
				v1[0] === v2[0] ||
				v1[0] === v2[1] ||
				v1[0] === v2[2] ||
				v1[0] === v2[3]
			) && (
				v1[1] === v2[0] ||
				v1[1] === v2[1] ||
				v1[1] === v2[2] ||
				v1[1] === v2[3]
			) && (
				v1[2] === v2[0] ||
				v1[2] === v2[1] ||
				v1[2] === v2[2] ||
				v1[2] === v2[3]
			) && (
				v1[3] === v2[0] ||
				v1[3] === v2[1] ||
				v1[3] === v2[2] ||
				v1[3] === v2[3]
			)
		);
	};

	vertices.forEach((v, i) => {
		v.originalIndexes = [i];
	});

	for (let i=vertices.length-1; i>=0; i--) {
		for (let ii=i-1; ii>=0; ii--) {
			const v1 = vertices[i];
			const v2 = vertices[ii];
			if (compareVertices(v1, v2)) {
				vertices.splice(i, 1);
				v2.originalIndexes.push(...v1.originalIndexes);
				break;
			}
		}
	}

	vertices.forEach((v, i) => {
		polys.forEach(p => {
			p.vIndexes.forEach((vi, ii, arr) => {
				const vo = v.originalIndexes;
				if (vo.includes(vi)) {
					arr[ii] = i;
				}
			});
		});
	});

	polys.forEach(p => {
		const vi = p.vIndexes;
		p.sum = vi[0] + vi[1] + vi[2] + vi[3];
	});
	polys.sort((a, b) => b.sum - a.sum);

	// Suposições:
	// 1. Cada polígono terá ou nenhum duplicado ou 1 duplicado.
	// 2. Se dois polígonos são iguais, ambos estão ocultos (dois cubos tocando),
	//    portanto, ambos podem ser removidos.
	for (let i=polys.length-1; i>=0; i--) {
		for (let ii=i-1; ii>=0; ii--) {
			const p1 = polys[i];
			const p2 = polys[ii];
			if (p1.sum !== p2.sum) break;
			if (comparePolys(p1, p2)) {
				polys.splice(i, 1);
				polys.splice(ii, 1);
				i--;
				break;
			}
		}
	}

	return model;
}

// Entity.js
// ============================================================================
// ============================================================================

class Entity {
	constructor({ model, color, wireframe=false }) {
		const vertices = cloneVertices(model.vertices);
		const shadowVertices = cloneVertices(model.vertices);
		const colorHex = colorToHex(color);
		const darkColorHex = shadeColor(color, 0.4);

		const polys = model.polys.map(p => ({
			vertices: p.vIndexes.map(vIndex => vertices[vIndex]),
			color: color, // objeto de cor rgb personalizado
			wireframe: wireframe,
			strokeWidth: wireframe ? 2 : 0, // Definir para valor diferente de zero para desenhar a linha
			strokeColor: colorHex, // deve ser uma string de cor CSS
			strokeColorDark: darkColorHex, // deve ser uma string de cor CSS
			depth: 0,
			middle: { x: 0, y: 0, z: 0 },
			normalWorld: { x: 0, y: 0, z: 0 },
			normalCamera: { x: 0, y: 0, z: 0 }
		}));

		const shadowPolys = model.polys.map(p => ({
			vertices: p.vIndexes.map(vIndex => shadowVertices[vIndex]),
			wireframe: wireframe,
			normalWorld: { x: 0, y: 0, z: 0 }
		}));

		this.projected = {}; // Armazenará dados projetados em 2D
		this.model = model;
		this.vertices = vertices;
		this.polys = polys;
		this.shadowVertices = shadowVertices;
		this.shadowPolys = shadowPolys;
		this.reset();
	}

	// Melhores nomes: resetEntity, resetTransform, resetEntityTransform
	reset() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xD = 0;
		this.yD = 0;
		this.zD = 0;

		this.rotateX = 0;
		this.rotateY = 0;
		this.rotateZ = 0;
		this.rotateXD = 0;
		this.rotateYD = 0;
		this.rotateZD = 0;

		this.scaleX = 1;
		this.scaleY = 1;
		this.scaleZ = 1;

		this.projected.x = 0;
		this.projected.y = 0;
	}

	transform() {
		transformVertices(
			this.model.vertices,
			this.vertices,
			this.x,
			this.y,
			this.z,
			this.rotateX,
			this.rotateY,
			this.rotateZ,
			this.scaleX,
			this.scaleY,
			this.scaleZ
		);

		copyVerticesTo(this.vertices, this.shadowVertices);
	}

	// Projeta o ponto de origem, armazenado como propriedade `projected`.
	project() {
		projectVertexTo(this, this.projected);
	}
}






// getTarget.js
// ============================================================================
// ============================================================================

// Todos os alvos ativos
const targets = [];

// Agrupar instâncias de alvos por cor, usando um Map.
// As chaves são objetos de cor e os valores são arrays de alvos.
// Também agrupar instâncias de wireframe separadamente.
const targetPool = new Map(allColors.map(c=>([c, []])));
const targetWireframePool = new Map(allColors.map(c=>([c, []])));

const getTarget = (() => {

	const slowmoSpawner = makeSpawner({
		chance: 0.5,
		cooldownPerSpawn: 10000,
		maxSpawns: 1
	});

	let doubleStrong = false;
	const strongSpawner = makeSpawner({
		chance: 0.3,
		cooldownPerSpawn: 12000,
		maxSpawns: 1
	});

	const spinnerSpawner = makeSpawner({
		chance: 0.1,
		cooldownPerSpawn: 10000,
		maxSpawns: 1
	});

	// Instâncias de arrays em cache, não há necessidade de alocar toda vez.
	const axisOptions = [
		['x', 'y'],
		['y', 'z'],
		['z', 'x']
	];

	function getTargetOfStyle(color, wireframe) {
		const pool = wireframe ? targetWireframePool : targetPool;
		let target = pool.get(color).pop();
		if (!target) {
			target = new Entity({
				model: optimizeModel(makeRecursiveCubeModel({
					recursionLevel: 1,
					splitFn: mengerSpongeSplit,
					scale: targetRadius
				})),
				color: color,
				wireframe: wireframe
			});

			// Inicializar quaisquer propriedades que serão usadas.
			// Estas não serão automaticamente resetadas quando recicladas.
			target.color = color;
			target.wireframe = wireframe;
			// Algumas propriedades ainda não têm seu valor final.
			// Inicializar com qualquer valor do tipo correto.
			target.hit = false;
			target.maxHealth = 0;
			target.health = 0;
		}
		return target;
	}

	return function getTarget() {
		if (doubleStrong && state.game.score <= doubleStrongEnableScore) {
			doubleStrong = false;
			// O gerador é resetado automaticamente quando o jogo é resetado.
		} else if (!doubleStrong && state.game.score > doubleStrongEnableScore) {
			doubleStrong = true;
			strongSpawner.mutate({ maxSpawns: 2 });
		}

		// Parâmetros do alvo
		// --------------------------------
		let color = pickOne([BLUE, GREEN, ORANGE]);
		let wireframe = false;
		let health = 1;
		let maxHealth = 3;
		const spinner = state.game.cubeCount >= spinnerThreshold && isInGame() && spinnerSpawner.shouldSpawn();

		// Substituições de parâmetros do alvo
		// --------------------------------
		if (state.game.cubeCount >= slowmoThreshold && slowmoSpawner.shouldSpawn()) {
			color = BLUE;
			wireframe = true;
		}
		else if (state.game.cubeCount >= strongThreshold && strongSpawner.shouldSpawn()) {
			color = PINK;
			health = 3;
		}

		// Criação do alvo
		// --------------------------------
		const target = getTargetOfStyle(color, wireframe);
		target.hit = false;
		target.maxHealth = maxHealth;
		target.health = health;
		updateTargetHealth(target, 0);

		const spinSpeeds = [
			Math.random() * 0.1 - 0.05,
			Math.random() * 0.1 - 0.05
		];

		if (spinner) {
			// Acaba girando um eixo aleatório
			spinSpeeds[0] = -0.25;
			spinSpeeds[1] = 0;
			target.rotateZ = random(0, TAU);
		}

		const axes = pickOne(axisOptions);

		spinSpeeds.forEach((spinSpeed, i) => {
			switch (axes[i]) {
				case 'x':
					target.rotateXD = spinSpeed;
					break;
				case 'y':
					target.rotateYD = spinSpeed;
					break;
				case 'z':
					target.rotateZD = spinSpeed;
					break;
			}
		});

		return target;
	}
})();

const updateTargetHealth = (target, healthDelta) => {
	target.health += healthDelta;
	// Atualizar o traço apenas em alvos que não sejam wireframe.
	// Mostrar "cola" é uma tentativa temporária de exibir a saúde. Por enquanto, não há razão para ter alvos wireframe com alta saúde, então estamos bem.
	if (!target.wireframe) {
		const strokeWidth = target.health - 1;
		const strokeColor = makeTargetGlueColor(target);
		for (let p of target.polys) {
			p.strokeWidth = strokeWidth;
			p.strokeColor = strokeColor;
		}
	}
};

const returnTarget = target => {
	target.reset();
	const pool = target.wireframe ? targetWireframePool : targetPool;
	pool.get(target.color).push(target);
};

function resetAllTargets() {
	while(targets.length) {
		returnTarget(targets.pop());
	}
}






// createBurst.js
// ============================================================================
// ============================================================================

// Rastrear todos os fragmentos ativos
const frags = [];
// Agrupar fragmentos inativos por cor, usando um Map.
// As chaves são objetos de cor, e os valores são arrays de fragmentos.
// Também agrupar instâncias de wireframe separadamente.
const fragPool = new Map(allColors.map(c=>([c, []])));
const fragWireframePool = new Map(allColors.map(c=>([c, []])));

const createBurst = (() => {
	// Pré-calcular alguns dados privados para serem reutilizados em todas as explosões.
	const basePositions = mengerSpongeSplit({ x:0, y:0, z:0 }, fragRadius*2);
	const positions = cloneVertices(basePositions);
	const prevPositions = cloneVertices(basePositions);
	const velocities = cloneVertices(basePositions);

	const basePositionNormals = basePositions.map(normalize);
	const positionNormals = cloneVertices(basePositionNormals);

	const fragCount = basePositions.length;

	function getFragForTarget(target) {
		const pool = target.wireframe ? fragWireframePool : fragPool;
		let frag = pool.get(target.color).pop();
		if (!frag) {
			frag = new Entity({
				model: makeCubeModel({ scale: fragRadius }),
				color: target.color,
				wireframe: target.wireframe
			});
			frag.color = target.color;
			frag.wireframe = target.wireframe;
		}
		return frag;
	}

	return (target, force=1) => {
		// Calcular posições dos fragmentos e quais seriam as posições anteriores
		// quando ainda faziam parte do alvo maior.
		transformVertices(
			basePositions, positions,
			target.x, target.y, target.z,
			target.rotateX, target.rotateY, target.rotateZ,
			1, 1, 1
		);
		transformVertices(
			basePositions, prevPositions,
			target.x - target.xD, target.y - target.yD, target.z - target.zD,
			target.rotateX - target.rotateXD, target.rotateY - target.rotateYD, target.rotateZ - target.rotateZD,
			1, 1, 1
		);

		// Calcular a velocidade de cada fragmento, com base nas posições anteriores.
		// Escreverá no array `velocities`.
		for (let i=0; i<fragCount; i++) {
			const position = positions[i];
			const prevPosition = prevPositions[i];
			const velocity = velocities[i];

			velocity.x = position.x - prevPosition.x;
			velocity.y = position.y - prevPosition.y;
			velocity.z = position.z - prevPosition.z;
		}

		// Aplicar rotação do alvo aos normais
		transformVertices(
			basePositionNormals, positionNormals,
			0, 0, 0,
			target.rotateX, target.rotateY, target.rotateZ,
			1, 1, 1
		);

		for (let i=0; i<fragCount; i++) {
			const position = positions[i];
			const velocity = velocities[i];
			const normal = positionNormals[i];

			const frag = getFragForTarget(target);

			frag.x = position.x;
			frag.y = position.y;
			frag.z = position.z;
			frag.rotateX = target.rotateX;
			frag.rotateY = target.rotateY;
			frag.rotateZ = target.rotateZ;

			const burstSpeed = 2 * force;
			const randSpeed = 2 * force;
			const rotateScale = 0.015;
			frag.xD = velocity.x + (normal.x * burstSpeed) + (Math.random() * randSpeed);
			frag.yD = velocity.y + (normal.y * burstSpeed) + (Math.random() * randSpeed);
			frag.zD = velocity.z + (normal.z * burstSpeed) + (Math.random() * randSpeed);
			frag.rotateXD = frag.xD * rotateScale;
			frag.rotateYD = frag.yD * rotateScale;
			frag.rotateZD = frag.zD * rotateScale;

			frags.push(frag);
		};
	}
})();

const returnFrag = frag => {
	frag.reset();
	const pool = frag.wireframe ? fragWireframePool : fragPool;
	pool.get(frag.color).push(frag);
};

// sparks.js
// ============================================================================
// ============================================================================

const sparks = [];
const sparkPool = [];

function addSpark(x, y, xD, yD) {
	const spark = sparkPool.pop() || {};

	spark.x = x + xD * 0.5;
	spark.y = y + yD * 0.5;
	spark.xD = xD;
	spark.yD = yD;
	spark.life = random(200, 300);
	spark.maxLife = spark.life;

	sparks.push(spark);

	return spark;
}

// Explosão esférica de faíscas
function sparkBurst(x, y, count, maxSpeed) {
	const angleInc = TAU / count;
	for (let i=0; i<count; i++) {
		const angle = i * angleInc + angleInc * Math.random();
		const speed = (1 - Math.random() ** 3) * maxSpeed;
		addSpark(
			x,
			y,
			Math.sin(angle) * speed,
			Math.cos(angle) * speed
		);
	}
}

// Fazer um alvo "vazar" faíscas de todos os vértices.
// Isso é usado para criar o efeito de "desprendimento" da cola do alvo.
let glueShedVertices;
function glueShedSparks(target) {
	if (!glueShedVertices) {
		glueShedVertices = cloneVertices(target.vertices);
	} else {
		copyVerticesTo(target.vertices, glueShedVertices);
	}

	glueShedVertices.forEach(v => {
		if (Math.random() < 0.4) {
			projectVertex(v);
			addSpark(
				v.x,
				v.y,
				random(-12, 12),
				random(-12, 12)
			);
		}
	});
}

function returnSpark(spark) {
	sparkPool.push(spark);
}

// hud.js
// ============================================================================
// ============================================================================

const hudContainerNode = $('.hud');

function setHudVisibility(visible) {
	if (visible) {
		hudContainerNode.style.display = 'block';
	} else {
		hudContainerNode.style.display = 'none';
	}
}

///////////
// Pontuação //
///////////
const scoreNode = $('.score-lbl');
const cubeCountNode = $('.cube-count-lbl');

function renderScoreHud() {
	if (isCasualGame()) {
		scoreNode.style.display = 'none';
		cubeCountNode.style.opacity = 1;
	} else {
		scoreNode.innerText = `PONTUAÇÃO: ${state.game.score}`;
		scoreNode.style.display = 'block';
		cubeCountNode.style.opacity = 0.65 ;
	}
	cubeCountNode.innerText = `CUBOS CORTADOS: ${state.game.cubeCount}`;
}

renderScoreHud();

//////////////////
// Botão de Pausa //
//////////////////

handlePointerDown($('.pause-btn'), () => pauseGame());

////////////////////
// Status de Slow-Mo //
////////////////////

const slowmoNode = $('.slowmo');
const slowmoBarNode = $('.slowmo__bar');

function renderSlowmoStatus(percentRemaining) {
	slowmoNode.style.opacity = percentRemaining === 0 ? 0 : 1;
	slowmoBarNode.style.transform = `scaleX(${percentRemaining.toFixed(3)})`;
}

// menus.js
// ============================================================================
// ============================================================================

// Contêineres de menu de nível superior
const menuContainerNode = $('.menus');
const menuMainNode = $('.menu--main');
const menuPauseNode = $('.menu--pause');
const menuScoreNode = $('.menu--score');

const finalScoreLblNode = $('.final-score-lbl');
const highScoreLblNode = $('.high-score-lbl');

function showMenu(node) {
	node.classList.add('active');
}

function hideMenu(node) {
	node.classList.remove('active');
}

function renderMenus() {
	hideMenu(menuMainNode);
	hideMenu(menuPauseNode);
	hideMenu(menuScoreNode);

	switch (state.menus.active) {
		case MENU_MAIN:
			showMenu(menuMainNode);
			break;
		case MENU_PAUSE:
			showMenu(menuPauseNode);
			break;
		case MENU_SCORE:
			finalScoreLblNode.textContent = formatNumber(state.game.score);
			if (isNewHighScore()) {
				highScoreLblNode.textContent = 'NOVA PONTUAÇÃO MÁXIMA!';
			} else {
				highScoreLblNode.textContent = `PONTUAÇÃO MÁXIMA: ${formatNumber(getHighScore())}`;
			}
			showMenu(menuScoreNode);
			break;
	}

	setHudVisibility(!isMenuVisible());
	menuContainerNode.classList.toggle('has-active', isMenuVisible());
	menuContainerNode.classList.toggle('interactive-mode', isMenuVisible() && pointerIsDown);
}


renderMenus();



////////////////////
// Button Actions //
////////////////////

// Main Menu
handleClick($('.play-normal-btn'), () => {
	setGameMode(GAME_MODE_RANKED);
	setActiveMenu(null);
	resetGame();
});

handleClick($('.play-casual-btn'), () => {
	setGameMode(GAME_MODE_CASUAL);
	setActiveMenu(null);
	resetGame();
});

// Pause Menu
handleClick($('.resume-btn'), () => resumeGame());
handleClick($('.menu-btn--pause'), () => setActiveMenu(MENU_MAIN));

// Score Menu
handleClick($('.play-again-btn'), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($('.menu-btn--score'), () => setActiveMenu(MENU_MAIN));




////////////////////
// Button Actions //
////////////////////

// Main Menu
handleClick($('.play-normal-btn'), () => {
	setGameMode(GAME_MODE_RANKED);
	setActiveMenu(null);
	resetGame();
});

handleClick($('.play-casual-btn'), () => {
	setGameMode(GAME_MODE_CASUAL);
	setActiveMenu(null);
	resetGame();
});

// Pause Menu
handleClick($('.resume-btn'), () => resumeGame());
handleClick($('.menu-btn--pause'), () => setActiveMenu(MENU_MAIN));

// Score Menu
handleClick($('.play-again-btn'), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($('.menu-btn--score'), () => setActiveMenu(MENU_MAIN));





// actions.js
// ============================================================================
// ============================================================================

//////////////////
// MENU ACTIONS //
//////////////////

function setActiveMenu(menu) {
	state.menus.active = menu;
	renderMenus();
}


/////////////////
// HUD ACTIONS //
/////////////////

function setScore(score) {
	state.game.score = score;
	renderScoreHud();
}

function incrementScore(inc) {
	if (isInGame()) {
		state.game.score += inc;
		if (state.game.score < 0) {
			state.game.score = 0;
		}
		renderScoreHud();
	}
}

function setCubeCount(count) {
	state.game.cubeCount = count;
	renderScoreHud();
}

function incrementCubeCount(inc) {
	if (isInGame()) {
		state.game.cubeCount += inc;
		renderScoreHud();
	}
}

//////////////////
// GAME ACTIONS //
//////////////////

function setGameMode(mode) {
	state.game.mode = mode;
}

function resetGame() {
	resetAllTargets();
	state.game.time = 0;
	resetAllCooldowns();
	setScore(0);
	setCubeCount(0);
	spawnTime = getSpawnDelay();
}

function pauseGame() {
	isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
	isPaused() && setActiveMenu(null);
}

function endGame() {
	handleCanvasPointerUp();
	if (isNewHighScore()) {
		setHighScore(state.game.score);
	}
	setActiveMenu(MENU_SCORE);
}



////////////////////////
// ATALHOS DO TECLADO //
////////////////////////

window.addEventListener('keydown', event => {
	if (event.key === 'p') {
		isPaused() ? resumeGame() : pauseGame();
	}
});






// tick.js
// ============================================================================
// ============================================================================


let spawnTime = 0;
const maxSpawnX = 450;
const pointerDelta = { x: 0, y: 0 };
const pointerDeltaScaled = { x: 0, y: 0 };

// Temp slowmo state. Should be relocated once this stabilizes.
const slowmoDuration = 1500;
let slowmoRemaining = 0;
let spawnExtra = 0;
const spawnExtraDelay = 300;
let targetSpeed = 1;


function tick(width, height, simTime, simSpeed, lag) {
	PERF_START('frame');
	PERF_START('tick');

	state.game.time += simTime;

	if (slowmoRemaining > 0) {
		slowmoRemaining -= simTime;
		if (slowmoRemaining < 0) {
			slowmoRemaining = 0;
		}
		targetSpeed = pointerIsDown ? 0.075 : 0.3;
	} else {
		const menuPointerDown = isMenuVisible() && pointerIsDown;
		targetSpeed = menuPointerDown ? 0.025 : 1;
	}

	renderSlowmoStatus(slowmoRemaining / slowmoDuration);

	gameSpeed += (targetSpeed - gameSpeed) / 22 * lag;
	gameSpeed = clamp(gameSpeed, 0, 1);

	const centerX = width / 2;
	const centerY = height / 2;

	const simAirDrag = 1 - (airDrag * simSpeed);
	const simAirDragSpark = 1 - (airDragSpark * simSpeed);

	// Rastreamento de ponteiro
  // -------------------

  // Calcula a velocidade e os deltas x/y.
  // Há também uma variante "escalada" que leva em consideração a velocidade do jogo. Isso serve a dois propósitos:
  // - Lag não criará grandes picos de velocidade/deltas
  // - Em câmera lenta, a velocidade aumenta proporcionalmente para corresponder à "realidade". Sem esse impulso,
  // parece que suas ações são amortecidas em câmera lenta.
	const forceMultiplier = 1 / (simSpeed * 0.75 + 0.25);
	pointerDelta.x = 0;
	pointerDelta.y = 0;
	pointerDeltaScaled.x = 0;
	pointerDeltaScaled.y = 0;
	const lastPointer = touchPoints[touchPoints.length - 1];

	if (pointerIsDown && lastPointer && !lastPointer.touchBreak) {
		pointerDelta.x = (pointerScene.x - lastPointer.x);
		pointerDelta.y = (pointerScene.y - lastPointer.y);
		pointerDeltaScaled.x = pointerDelta.x * forceMultiplier;
		pointerDeltaScaled.y = pointerDelta.y * forceMultiplier;
	}
	const pointerSpeed = Math.hypot(pointerDelta.x, pointerDelta.y);
	const pointerSpeedScaled = pointerSpeed * forceMultiplier;

	// Rastreia pontos para cálculos posteriores, incluindo trilha de desenho.
	touchPoints.forEach(p => p.life -= simTime);

	if (pointerIsDown) {
		touchPoints.push({
			x: pointerScene.x,
			y: pointerScene.y,
			life: touchPointLife
		});
	}

	while (touchPoints[0] && touchPoints[0].life <= 0) {
		touchPoints.shift();
	}


// Manipulação de entidade
  // --------------------
	PERF_START('entities');

	// Spawn targets
	spawnTime -= simTime;
	if (spawnTime <= 0) {
		if (spawnExtra > 0) {
			spawnExtra--;
			spawnTime = spawnExtraDelay;
		} else {
			spawnTime = getSpawnDelay();
		}
		const target = getTarget();
		const spawnRadius = Math.min(centerX * 0.8, maxSpawnX);
		target.x = (Math.random() * spawnRadius * 2 - spawnRadius);
		target.y = centerY + targetHitRadius * 2;
		target.z = (Math.random() * targetRadius*2 - targetRadius);
		target.xD = Math.random() * (target.x * -2 / 120);
		target.yD = -20;
		targets.push(target);
	}

	// Anima os alvos e remove quando estiver fora da tela
	const leftBound = -centerX + targetRadius;
	const rightBound = centerX - targetRadius;
	const ceiling = -centerY - 120;
	const boundDamping = 0.4;

	targetLoop:
	for (let i = targets.length - 1; i >= 0; i--) {
		const target = targets[i];
		target.x += target.xD * simSpeed;
		target.y += target.yD * simSpeed;

		if (target.y < ceiling) {
			target.y = ceiling;
			target.yD = 0;
		}

		if (target.x < leftBound) {
			target.x = leftBound;
			target.xD *= -boundDamping;
		} else if (target.x > rightBound) {
			target.x = rightBound;
			target.xD *= -boundDamping;
		}

		if (target.z < backboardZ) {
			target.z = backboardZ;
			target.zD *= -boundDamping;
		}

		target.yD += gravity * simSpeed;
		target.rotateX += target.rotateXD * simSpeed;
		target.rotateY += target.rotateYD * simSpeed;
		target.rotateZ += target.rotateZD * simSpeed;
		target.transform();
		target.project();

		// Remove if offscreen
		if (target.y > centerY + targetHitRadius * 2) {
			targets.splice(i, 1);
			returnTarget(target);
			if (isInGame()) {
				if (isCasualGame()) {
					incrementScore(-25);
				} else {
					endGame();
				}
			}
			continue;
		}


// Se o ponteiro estiver se movendo muito rápido, queremos atingir vários pontos ao longo do caminho.
  // Não podemos usar a velocidade do ponteiro em escala para determinar isso, pois nos preocupamos com a tela real
  // distância percorrida.
		const hitTestCount = Math.ceil(pointerSpeed / targetRadius * 2);
		// Inicia o loop em `1` e usa a verificação `<=`, então pulamos 0% e terminamos em 100%.
  // Isto omite a posição do ponto anterior e inclui a mais recente.
		for (let ii=1; ii<=hitTestCount; ii++) {
			const percent = 1 - (ii / hitTestCount);
			const hitX = pointerScene.x - pointerDelta.x * percent;
			const hitY = pointerScene.y - pointerDelta.y * percent;
			const distance = Math.hypot(
				hitX - target.projected.x,
				hitY - target.projected.y
			);

			if (distance <= targetHitRadius) {
				// Bater! (embora não queiramos permitir acessos em vários quadros sequenciais)
				if (!target.hit) {
					target.hit = true;

					target.xD += pointerDeltaScaled.x * hitDampening;
					target.yD += pointerDeltaScaled.y * hitDampening;
					target.rotateXD += pointerDeltaScaled.y * 0.001;
					target.rotateYD += pointerDeltaScaled.x * 0.001;

					const sparkSpeed = 7 + pointerSpeedScaled * 0.125;

					if (pointerSpeedScaled > minPointerSpeed) {
						target.health--;
						incrementScore(10);

						if (target.health <= 0) {
							incrementCubeCount(1);
							createBurst(target, forceMultiplier);
							sparkBurst(hitX, hitY, 8, sparkSpeed);
							if (target.wireframe) {
								slowmoRemaining = slowmoDuration;
								spawnTime = 0;
								spawnExtra = 2;
							}
							targets.splice(i, 1);
							returnTarget(target);
						} else {
							sparkBurst(hitX, hitY, 8, sparkSpeed);
							glueShedSparks(target);
							updateTargetHealth(target, 0);
						}
					} else {
						incrementScore(5);
						sparkBurst(hitX, hitY, 3, sparkSpeed);
					}
				}
				// Interrompe o loop atual e continua o loop externo.
  // Isso pula para o processamento do próximo alvo.
				continue targetLoop;
			}
		}

		// Este código só será executado se o alvo não tiver sido "acertado".
		target.hit = false;
	}

	// Anima fragmentos e remove quando estiver fora da tela.
	const fragBackboardZ = backboardZ + fragRadius;
	// Permitir que os fragmentos se movam para fora da tela e para os lados por um tempo, já que as sombras ainda são visíveis.
	const fragLeftBound = -width;
	const fragRightBound = width;

	for (let i = frags.length - 1; i >= 0; i--) {
		const frag = frags[i];
		frag.x += frag.xD * simSpeed;
		frag.y += frag.yD * simSpeed;
		frag.z += frag.zD * simSpeed;

		frag.xD *= simAirDrag;
		frag.yD *= simAirDrag;
		frag.zD *= simAirDrag;

		if (frag.y < ceiling) {
			frag.y = ceiling;
			frag.yD = 0;
		}

		if (frag.z < fragBackboardZ) {
			frag.z = fragBackboardZ;
			frag.zD *= -boundDamping;
		}

		frag.yD += gravity * simSpeed;
		frag.rotateX += frag.rotateXD * simSpeed;
		frag.rotateY += frag.rotateYD * simSpeed;
		frag.rotateZ += frag.rotateZD * simSpeed;
		frag.transform();
		frag.project();

		//Condições de remoção
		if (
			// Parte inferior da tela
			frag.projected.y > centerY + targetHitRadius ||
			// Sides of screen
			frag.projected.x < fragLeftBound ||
			frag.projected.x > fragRightBound ||
			// Muito perto da câmera // Muito perto da câmera
			frag.z > cameraFadeEndZ
		) {
			frags.splice(i, 1);
			returnFrag(frag);
			continue;
		}
	}

	// 2D sparks
	for (let i = sparks.length - 1; i >= 0; i--) {
		const spark = sparks[i];
		spark.life -= simTime;
		if (spark.life <= 0) {
			sparks.splice(i, 1);
			returnSpark(spark);
			continue;
		}
		spark.x += spark.xD * simSpeed;
		spark.y += spark.yD * simSpeed;
		spark.xD *= simAirDragSpark;
		spark.yD *= simAirDragSpark;
		spark.yD += gravity * simSpeed;
	}

	PERF_END('entities');

	// 3D transforms
	// -------------------

	PERF_START('3D');

	// Agrega todos os vértices/polis da cena
	allVertices.length = 0;
	allPolys.length = 0;
	allShadowVertices.length = 0;
	allShadowPolys.length = 0;
	targets.forEach(entity => {
		allVertices.push(...entity.vertices);
		allPolys.push(...entity.polys);
		allShadowVertices.push(...entity.shadowVertices);
		allShadowPolys.push(...entity.shadowPolys);
	});

	frags.forEach(entity => {
		allVertices.push(...entity.vertices);
		allPolys.push(...entity.polys);
		allShadowVertices.push(...entity.shadowVertices);
		allShadowPolys.push(...entity.shadowPolys);
	});

	// Cálculos/transformações de cena
	allPolys.forEach(p => computePolyNormal(p, 'normalWorld'));
	allPolys.forEach(computePolyDepth);
	allPolys.sort((a, b) => b.depth - a.depth);

	//Projeção em perspectiva
	allVertices.forEach(projectVertex);

	allPolys.forEach(p => computePolyNormal(p, 'normalCamera'));

	PERF_END('3D');

	PERF_START('shadows');

	// Gira os vértices da sombra para a perspectiva da fonte de luz
	transformVertices(
		allShadowVertices,
		allShadowVertices,
		0, 0, 0,
		TAU/8, 0, 0,
		1, 1, 1
	);

	allShadowPolys.forEach(p => computePolyNormal(p, 'normalWorld'));

	const shadowDistanceMult = Math.hypot(1, 1);
	const shadowVerticesLength = allShadowVertices.length;
	for (let i=0; i<shadowVerticesLength; i++) {
		const distance = allVertices[i].z - backboardZ;
		allShadowVertices[i].z -= shadowDistanceMult * distance;
	}
	transformVertices(
		allShadowVertices,
		allShadowVertices,
		0, 0, 0,
		-TAU/8, 0, 0,
		1, 1, 1
	);
	allShadowVertices.forEach(projectVertex);

	PERF_END('shadows');

	PERF_END('tick');
}





// draw.js
// ============================================================================
// ============================================================================

function draw(ctx, width, height, viewScale) {
	PERF_START('draw');

	const halfW = width / 2;
	const halfH = height / 2;


	// 3D Polys
	// ---------------
	ctx.lineJoin = 'bevel';

	PERF_START('drawShadows');
	ctx.fillStyle = shadowColor;
	ctx.strokeStyle = shadowColor;
	allShadowPolys.forEach(p => {
		if (p.wireframe) {
			ctx.lineWidth = 2;
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i=1; i<vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.stroke();
		} else {
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i=1; i<vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.fill();
		}
	});
	PERF_END('drawShadows');

	PERF_START('drawPolys');

	allPolys.forEach(p => {
		if (!p.wireframe && p.normalCamera.z < 0) return;

		if (p.strokeWidth !== 0) {
			ctx.lineWidth = p.normalCamera.z < 0 ? p.strokeWidth * 0.5 : p.strokeWidth;
			ctx.strokeStyle = p.normalCamera.z < 0 ? p.strokeColorDark : p.strokeColor;
		}

		const { vertices } = p;
		const lastV = vertices[vertices.length - 1];
		const fadeOut = p.middle.z > cameraFadeStartZ;

		if (!p.wireframe) {
			const normalLight = p.normalWorld.y * 0.5 + p.normalWorld.z * -0.5;
			const lightness = normalLight > 0
				? 0.1
				: ((normalLight ** 32 - normalLight) / 2) * 0.9 + 0.1;
			ctx.fillStyle = shadeColor(p.color, lightness);
		}

		// Fade out polys perto da câmera. `globalAlpha` deve ser redefinido mais tarde.
		if (fadeOut) {
			// Se o polígono chegar muito perto da câmera (fora de `cameraFadeRange`), o alfa
  // pode ficar negativo, o que tem a aparência de alfa = 1. Então, vamos fixá-lo em 0.
			ctx.globalAlpha = Math.max(0, 1 - (p.middle.z - cameraFadeStartZ) / cameraFadeRange);
		}

		ctx.beginPath();
		ctx.moveTo(lastV.x, lastV.y);
		for (let v of vertices) {
			ctx.lineTo(v.x, v.y);
		}

		if (!p.wireframe) {
			ctx.fill();
		}
		if (p.strokeWidth !== 0) {
			ctx.stroke();
		}

		if (fadeOut) {
			ctx.globalAlpha = 1;
		}
	});
	PERF_END('drawPolys');


	PERF_START('draw2D');

	// 2D Sparks
	// ---------------
	ctx.strokeStyle = sparkColor;
	ctx.lineWidth = sparkThickness;
	ctx.beginPath();
	sparks.forEach(spark => {
		ctx.moveTo(spark.x, spark.y);
		// Reduz as faíscas para comprimento zero à medida que morrem.
  // Acelera o encolhimento conforme a vida se aproxima de 0 (curva raiz).
  // Observe que as faíscas já ficam menores com o tempo à medida que sua velocidade diminui
  // abaixo do amortecimento. Então isso é como uma redução dupla. Para combater isso
  // um pouco e manteremos as faíscas maiores por mais tempo, também aumentaremos a escala
  // um pouco depois de aplicar a curva raiz.
		const scale = (spark.life / spark.maxLife) ** 0.5 * 1.5;
		ctx.lineTo(spark.x - spark.xD*scale, spark.y - spark.yD*scale);

	});
	ctx.stroke();


	// Touch Strokes
	// ---------------

	ctx.strokeStyle = touchTrailColor;
	const touchPointCount = touchPoints.length;
	for (let i=1; i<touchPointCount; i++) {
		const current = touchPoints[i];
		const prev = touchPoints[i-1];
		if (current.touchBreak || prev.touchBreak) {
			continue;
		}
		const scale = current.life / touchPointLife;
		ctx.lineWidth = scale * touchTrailThickness;
		ctx.beginPath();
		ctx.moveTo(prev.x, prev.y);
		ctx.lineTo(current.x, current.y);
		ctx.stroke();
	}

	PERF_END('draw2D');

	PERF_END('draw');
	PERF_END('frame');

	// Exibir atualizações de desempenho.
	PERF_UPDATE();
}





// canvas.js
// ============================================================================
// ============================================================================

function setupCanvases() {
	const ctx = canvas.getContext('2d');
	// alias devicePixelRatio
	const dpr = window.devicePixelRatio || 1;
	// A visualização será dimensionada para que os objetos apareçam com tamanhos semelhantes em todos os tamanhos de tela.
	let viewScale;
	// Dimensões (levando em consideração viewScale!)
	let width, height;

	function handleResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		viewScale = h / 1000;
		width = w / viewScale;
		height = h / viewScale;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
	}

	// Define o tamanho inicial
	handleResize();
	// redimensiona a tela em tela cheia
	window.addEventListener('resize', handleResize);


	//Executa o loop do jogo
	let lastTimestamp = 0;
	function frameHandler(timestamp) {
		let frameTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;

		// sempre enfileira outro quadro
		raf();

		// Se o jogo estiver pausado, ainda rastrearemos o frameTime (acima), mas todos os outros
  // lógica e desenho do jogo podem ser evitados.
		if (isPaused()) return;

		// certifique-se de que o tempo negativo não seja relatado (o primeiro quadro pode ser maluco)
		if (frameTime < 0) {
			frameTime = 17;
		}
		// - limita a taxa de quadros mínima para 15fps[~68ms] (assumindo 60fps[~17ms] como 'normal')
		else if (frameTime > 68) {
			frameTime = 68;
		}

		const halfW = width / 2;
		const halfH = height / 2;

		// Converte a posição do ponteiro da tela para as coordenadas da cena.
		pointerScene.x = pointerScreen.x / viewScale - halfW;
		pointerScene.y = pointerScreen.y / viewScale - halfH;

		const lag = frameTime / 16.6667;
		const simTime = gameSpeed * frameTime;
		const simSpeed = gameSpeed * lag;
		tick(width, height, simTime, simSpeed, lag);

	// Tela de limpeza automática
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Desenho em escala automática para telas de alta resolução e incorpora `viewScale`.
  // Também muda a tela para que (0, 0) fique no meio da tela.
  // Isso só funciona com projeção em perspectiva 3D.
		const drawScale = dpr * viewScale;
		ctx.scale(drawScale, drawScale);
		ctx.translate(halfW, halfH);
		draw(ctx, width, height, viewScale);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
	const raf = () => requestAnimationFrame(frameHandler);
	// Start loop
	raf();
}





// interaction.js
// ============================================================================
// ============================================================================

// Interaction
// -----------------------------

function handleCanvasPointerDown(x, y) {
	if (!pointerIsDown) {
		pointerIsDown = true;
		pointerScreen.x = x;
		pointerScreen.y = y;
		// Ativado quando os menus estão abertos, apontar para baixo/para cima alterna um modo interativo.
  // Precisamos apenas renderizar novamente o sistema de menu para que ele responda.
		if (isMenuVisible()) renderMenus();
	}
}

function handleCanvasPointerUp() {
	if (pointerIsDown) {
		pointerIsDown = false;
		touchPoints.push({
			touchBreak: true,
			life: touchPointLife
		});
		// Ativado quando os menus estão abertos, apontar para baixo/para cima alterna um modo interativo.
  // Precisamos apenas renderizar novamente o sistema de menu para que ele responda.
		if (isMenuVisible()) renderMenus();
	}
}

function handleCanvasPointerMove(x, y) {
	if (pointerIsDown) {
		pointerScreen.x = x;
		pointerScreen.y = y;
	}
}


// Use eventos de ponteiro se disponíveis, caso contrário, use eventos de toque (para iOS).
if ('PointerEvent' in window) {
	canvas.addEventListener('pointerdown', event => {
		event.isPrimary && handleCanvasPointerDown(event.clientX, event.clientY);
	});

	canvas.addEventListener('pointerup', event => {
		event.isPrimary && handleCanvasPointerUp();
	});

	canvas.addEventListener('pointermove', event => {
		event.isPrimary && handleCanvasPointerMove(event.clientX, event.clientY);
	});

	// Também precisamos saber se o mouse sai da página. Para este jogo, é melhor que isso
  // cancela um deslizar, portanto atua essencialmente como um evento "mouseup".
	document.body.addEventListener('mouseleave', handleCanvasPointerUp);
} else {
	let activeTouchId = null;
	canvas.addEventListener('touchstart', event => {
		if (!pointerIsDown) {
			const touch = event.changedTouches[0];
			activeTouchId = touch.identifier;
			handleCanvasPointerDown(touch.clientX, touch.clientY);
		}
	});
	canvas.addEventListener('touchend', event => {
		for (let touch of event.changedTouches) {
			if (touch.identifier === activeTouchId) {
				handleCanvasPointerUp();
				break;
			}
		}
	});
	canvas.addEventListener('touchmove', event => {
		for (let touch of event.changedTouches) {
			if (touch.identifier === activeTouchId) {
				handleCanvasPointerMove(touch.clientX, touch.clientY);
				event.preventDefault();
				break;
			}
		}
	}, { passive: false });
}





// index.js
// ============================================================================
// ============================================================================

setupCanvases();
