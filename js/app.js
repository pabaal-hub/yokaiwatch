
(() => {
	"use strict";

	const STORAGE_KEY = "yokai-hasbro-collection-v1";
	const DUPLICATES_KEY = "yokai-hasbro-duplicates-v1";

	const $ = id => document.getElementById(id);

	let catalogue = null;
	let ownership = {};
	let duplicates = {};
	let activeFilter = "all";
	let activeSort = "original";
	let expandedCollections = {};

	// ============================================================
	// ESTILOS
	// ============================================================

	function addModalStyles() {
		const style = document.createElement("style");

		style.textContent = `
			.medal-image-button {
				display: block;
				flex-shrink: 0;
				padding: 0;
				border: 0;
				background: transparent;
				cursor: zoom-in;
				border-radius: 8px;
				overflow: hidden;
			}

			.medal-image-button:focus-visible {
				outline: 3px solid var(--accent, #777);
				outline-offset: 3px;
			}

			/* ORDENACIÓN */

			.sort-control {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				margin: 10px 0;
			}

			.sort-control label {
				font-size: 0.9rem;
				white-space: nowrap;
			}

			.sort-control select {
				max-width: 100%;
				padding: 8px 10px;
				border: 1px solid var(--border, #ccc);
				border-radius: 6px;
				background: var(--card, #fff);
				color: var(--text, #222);
				font: inherit;
				cursor: pointer;
			}

			/* MODAL */

			.medal-modal {
				position: fixed;
				inset: 0;
				z-index: 9999;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 20px;
				background: rgba(0, 0, 0, 0.78);
				opacity: 0;
				visibility: hidden;
				transition: opacity 0.2s ease, visibility 0.2s ease;
			}

			.medal-modal.open {
				opacity: 1;
				visibility: visible;
			}

			.medal-modal-card {
				position: relative;
				width: min(100%, 440px);
				max-height: 90vh;
				overflow-y: auto;
				padding: 24px;
				border-radius: 16px;
				background: var(--card, #fff);
				color: var(--text, #222);
				text-align: center;
				box-shadow: 0 15px 60px rgba(0, 0, 0, 0.35);
				transform: scale(0.96);
				transition: transform 0.2s ease;
			}

			.medal-modal.open .medal-modal-card {
				transform: scale(1);
			}

			.medal-modal-close {
				position: absolute;
				top: 10px;
				right: 12px;
				width: 36px;
				height: 36px;
				border: 0;
				border-radius: 50%;
				background: var(--surface, #eee);
				color: inherit;
				font-size: 26px;
				line-height: 1;
				cursor: pointer;
			}

			.medal-modal-image {
				display: block;
				width: 100%;
				height: min(55vh, 420px);
				object-fit: contain;
				margin: 12px auto 20px;
			}

			.medal-modal-name {
				margin: 0 0 8px;
				font-size: 1.5rem;
				font-weight: 700;
			}

			.medal-modal-reference {
				margin: 0 0 6px;
				font-size: 0.95rem;
				opacity: 0.75;
			}

			.medal-modal-collection {
				margin: 0;
				font-size: 0.85rem;
				opacity: 0.65;
			}

			/* COLECCIONES COLAPSABLES */

			.group {
				overflow: hidden;
			}

			.group-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 12px;
				cursor: pointer;
				user-select: none;
			}

			.group-toggle {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex: 1;
				min-width: 0;
				gap: 12px;
				padding: 0;
				border: 0;
				background: transparent;
				color: inherit;
				text-align: left;
				font: inherit;
				cursor: pointer;
			}

			.group-toggle:focus-visible {
				outline: 2px solid var(--accent, #777);
				outline-offset: 4px;
				border-radius: 4px;
			}

			.group-toggle-content {
				display: flex;
				align-items: center;
				gap: 12px;
				min-width: 0;
			}

			.group-chevron {
				display: inline-block;
				flex-shrink: 0;
				transition: transform 0.2s ease;
			}

			.group.collapsed .group-chevron {
				transform: rotate(-90deg);
			}

			.group-content {
				display: grid;
				grid-template-rows: 1fr;
				transition: grid-template-rows 0.2s ease;
			}

			.group.collapsed .group-content {
				grid-template-rows: 0fr;
			}

			.group-content-inner {
				min-height: 0;
				overflow: hidden;
			}

			.group-content-inner > .medal-row:first-child {
				margin-top: 12px;
			}

			/* CONTROLES DE LAS MEDALLAS */

			.medal-controls {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				flex-shrink: 0;
				gap: 14px;
			}

			.medal-owned-label,
			.medal-repeat-label {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 5px;
				cursor: pointer;
				user-select: none;
			}

			.medal-owned-label input,
			.medal-repeat-label input {
				cursor: pointer;
				width: 17px;
				height: 17px;
				margin: 0;
				accent-color: var(--accent, #777);
			}

			.medal-repeat-label {
				gap: 5px;
				font-size: 0.85rem;
				font-weight: 700;
				opacity: 0.8;
			}

			.medal-repeat-label input {
				accent-color: #d49b36;
			}

			.medal-repeat-label:has(input:checked) {
				color: #b27b16;
				opacity: 1;
			}

			@media (max-width: 480px) {
				.medal-modal {
					padding: 12px;
				}

				.medal-modal-card {
					padding: 20px 16px;
				}

				.medal-modal-image {
					height: 50vh;
				}

				.medal-controls {
					gap: 10px;
				}

				.sort-control {
					flex-wrap: wrap;
				}
			}
		`;

		document.head.append(style);
	}

	// ============================================================
	// SELECTOR DE ORDENACIÓN
	// ============================================================

	function createSortControl() {
		const wrapper = document.createElement("div");
		wrapper.className = "sort-control";

		const label = document.createElement("label");
		label.htmlFor = "sort-filter";
		label.textContent = "Ordenar por:";

		const select = document.createElement("select");
		select.id = "sort-filter";

		const options = [
			["original", "Orden original"],
			["name-asc", "Nombre: A-Z"],
			["name-desc", "Nombre: Z-A"],
			["reference-asc", "Referencia: ascendente"],
			["reference-desc", "Referencia: descendente"]
		];

		for (const [value, text] of options) {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = text;
			select.append(option);
		}

		select.addEventListener("change", () => {
			activeSort = select.value;
			render();
		});

		wrapper.append(label, select);

		$("search").insertAdjacentElement("afterend", wrapper);
	}

	// ============================================================
	// COMPARACIÓN Y ORDENACIÓN
	// ============================================================

	function compareText(a, b) {
		return String(a || "").localeCompare(
			String(b || ""),
			"es",
			{
				numeric: true,
				sensitivity: "base"
			}
		);
	}

	function sortMedals(rows) {
		if (activeSort === "original") {
			return rows;
		}

		return [...rows].sort((a, b) => {
			if (activeSort === "name-asc") {
				return compareText(a.name, b.name);
			}

			if (activeSort === "name-desc") {
				return compareText(b.name, a.name);
			}

			if (
				activeSort === "reference-asc" ||
				activeSort === "reference-desc"
			) {
				const refA = String(a.reference || "").trim();
				const refB = String(b.reference || "").trim();

				// Las medallas sin referencia siempre van al final.
				if (!refA && refB) return 1;
				if (refA && !refB) return -1;
				if (!refA && !refB) return 0;

				const result = compareText(refA, refB);

				return activeSort === "reference-desc"
					? -result
					: result;
			}

			return 0;
		});
	}

	// ============================================================
	// MODAL
	// ============================================================

	let modal = null;

	function createModal() {
		modal = document.createElement("div");
		modal.className = "medal-modal";
		modal.setAttribute("role", "dialog");
		modal.setAttribute("aria-modal", "true");
		modal.setAttribute("aria-label", "Detalle de la medalla");

		const card = document.createElement("div");
		card.className = "medal-modal-card";

		const close = document.createElement("button");
		close.className = "medal-modal-close";
		close.type = "button";
		close.textContent = "×";
		close.setAttribute("aria-label", "Cerrar");

		const image = document.createElement("img");
		image.className = "medal-modal-image";
		image.alt = "";

		const name = document.createElement("h2");
		name.className = "medal-modal-name";

		const reference = document.createElement("p");
		reference.className = "medal-modal-reference";

		const collection = document.createElement("p");
		collection.className = "medal-modal-collection";

		card.append(close, image, name, reference, collection);
		modal.append(card);
		document.body.append(modal);

		close.addEventListener("click", closeModal);

		modal.addEventListener("click", event => {
			if (event.target === modal) closeModal();
		});

		document.addEventListener("keydown", event => {
			if (event.key === "Escape" && modal.classList.contains("open")) {
				closeModal();
			}
		});

		return modal;
	}

	function openModal(medal) {
		if (!modal) return;

		const image = modal.querySelector(".medal-modal-image");
		const name = modal.querySelector(".medal-modal-name");
		const reference = modal.querySelector(".medal-modal-reference");
		const collection = modal.querySelector(".medal-modal-collection");

		image.src = medal.image;
		image.alt = `Medalla ${medal.name}`;

		name.textContent = medal.name;

		reference.textContent = medal.reference
			? `Referencia: ${medal.reference}`
			: "Referencia pendiente";

		collection.textContent = medal.collectionName;

		modal.classList.add("open");
		document.body.style.overflow = "hidden";

		modal.querySelector(".medal-modal-close").focus();
	}

	function closeModal() {
		if (!modal) return;

		modal.classList.remove("open");
		document.body.style.overflow = "";
	}

	// ============================================================
	// DATOS Y ALMACENAMIENTO
	// ============================================================

	function loadOwnership() {
		try {
			ownership = JSON.parse(
				localStorage.getItem(STORAGE_KEY) || "{}"
			);
		} catch (_) {
			ownership = {};
		}

		try {
			duplicates = JSON.parse(
				localStorage.getItem(DUPLICATES_KEY) || "{}"
			);
		} catch (_) {
			duplicates = {};
		}
	}

	function saveOwnership() {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(ownership)
		);
	}

	function saveDuplicates() {
		localStorage.setItem(
			DUPLICATES_KEY,
			JSON.stringify(duplicates)
		);
	}

	function allMedals() {
		return catalogue.collections.flatMap(collection =>
			collection.medals.map(medal => ({
				...medal,
				collectionId: collection.id,
				collectionName: collection.name
			}))
		);
	}

	// ============================================================
	// RESUMEN
	// ============================================================

	function updateSummary() {
		const medals = allMedals();
		const total = medals.length;

		const owned = medals.filter(
			medal => ownership[medal.id]
		).length;

		const percent = total
			? Math.round(owned / total * 100)
			: 0;

		$("owned-count").textContent = owned;

		$("total-count").textContent =
			`${total} medallas catalogadas`;

		$("progress-percent").textContent =
			`${percent} %`;

		$("progress-bar").style.width =
			`${percent}%`;
	}

	// ============================================================
	// IMÁGENES
	// ============================================================

	function makeImage(medal) {
		const button = document.createElement("button");

		button.type = "button";
		button.className = "medal-image-button";

		button.setAttribute(
			"aria-label",
			`Ampliar imagen de ${medal.name}`
		);

		if (medal.image) {
			const img = document.createElement("img");

			img.className = "medal-image";
			img.src = medal.image;
			img.alt = `Medalla ${medal.name}`;
			img.loading = "lazy";

			img.onerror = () => {
				const placeholder = document.createElement("div");

				placeholder.className =
					"medal-image medal-placeholder";

				placeholder.textContent = "YO-KAI";

				button.replaceChildren(placeholder);
				button.disabled = true;
				button.style.cursor = "default";
			};

			button.append(img);

			button.addEventListener("click", () => {
				openModal(medal);
			});

		} else {
			const placeholder = document.createElement("div");

			placeholder.className =
				"medal-image medal-placeholder";

			placeholder.textContent = "YO-KAI";

			button.append(placeholder);
			button.disabled = true;
			button.style.cursor = "default";
		}

		return button;
	}

	// ============================================================
	// CONTROLES DE CADA MEDALLA
	// ============================================================

	function makeControls(medal) {
		const controls = document.createElement("div");
		controls.className = "medal-controls";

		// CASILLA DE POSESIÓN

		const ownedLabel = document.createElement("label");
		ownedLabel.className = "medal-owned-label";

		const ownedCheckbox = document.createElement("input");
		ownedCheckbox.type = "checkbox";
		ownedCheckbox.checked = !!ownership[medal.id];

		ownedCheckbox.setAttribute(
			"aria-label",
			`Tengo ${medal.name}`
		);

		ownedCheckbox.addEventListener("change", () => {
			ownership[medal.id] = ownedCheckbox.checked;

			saveOwnership();
			render();
		});

		ownedLabel.append(ownedCheckbox);

		// CASILLA DE REPETICIÓN

		const repeatLabel = document.createElement("label");
		repeatLabel.className = "medal-repeat-label";

		const repeatText = document.createElement("span");
		repeatText.textContent = "R";

		const repeatCheckbox = document.createElement("input");
		repeatCheckbox.type = "checkbox";
		repeatCheckbox.checked = !!duplicates[medal.id];

		repeatCheckbox.setAttribute(
			"aria-label",
			`Tengo repetida la medalla ${medal.name}`
		);

		repeatCheckbox.title = "Marcar como repetida";

		repeatCheckbox.addEventListener("change", () => {
			if (repeatCheckbox.checked) {
				duplicates[medal.id] = true;
			} else {
				delete duplicates[medal.id];
			}

			saveDuplicates();
			render();
		});

		repeatLabel.append(repeatText, repeatCheckbox);

		controls.append(ownedLabel, repeatLabel);

		return controls;
	}

	// ============================================================
	// RENDERIZADO DEL CATÁLOGO
	// ============================================================

	function render() {
		const collectionId = $("collection-filter").value;

		const query = $("search")
			.value.trim()
			.toLocaleLowerCase("es");

		const medals = allMedals().filter(medal => {
			const matchesCollection =
				collectionId === "all" ||
				medal.collectionId === collectionId;

			const matchesQuery =
				!query ||
				`${medal.name} ${medal.reference} ${medal.collectionName}`
					.toLocaleLowerCase("es")
					.includes(query);

			const matchesState =
				activeFilter === "all" ||
				(
					activeFilter === "owned"
						? !!ownership[medal.id]
						: activeFilter === "missing"
							? !ownership[medal.id]
							: activeFilter === "duplicates"
								? !!duplicates[medal.id]
								: true
				);

			return (
				matchesCollection &&
				matchesQuery &&
				matchesState
			);
		});

		const container = $("catalogue");
		container.replaceChildren();

		const collections = catalogue.collections.filter(
			collection =>
				collectionId === "all" ||
				collection.id === collectionId
		);

		let shown = 0;

		for (const collection of collections) {
			const rows = sortMedals(
				medals.filter(
					medal => medal.collectionId === collection.id
				)
			);

			if (!rows.length) continue;

			shown += rows.length;

			const section = document.createElement("section");
			section.className = "group";

			const expanded =
				collectionId !== "all" ||
				expandedCollections[collection.id] === true;

			section.classList.toggle("collapsed", !expanded);

			// CABECERA

			const header = document.createElement("div");
			header.className = "group-head";

			const toggle = document.createElement("button");
			toggle.type = "button";
			toggle.className = "group-toggle";

			toggle.setAttribute("aria-expanded", String(expanded));

			const titleWrap = document.createElement("div");
			titleWrap.className = "group-toggle-content";

			const chevron = document.createElement("span");
			chevron.className = "group-chevron";
			chevron.textContent = "▼";
			chevron.setAttribute("aria-hidden", "true");

			const title = document.createElement("h2");
			title.textContent = collection.name;

			const count = document.createElement("div");
			count.className = "group-count";

			const collected = collection.medals.filter(
				medal => ownership[medal.id]
			).length;

			count.textContent =
				`${collected} / ${collection.medals.length} conseguidas`;

			titleWrap.append(chevron, title);
			toggle.append(titleWrap, count);

			toggle.addEventListener("click", () => {
				const isCollapsed =
					section.classList.toggle("collapsed");

				toggle.setAttribute(
					"aria-expanded",
					String(!isCollapsed)
				);

				expandedCollections[collection.id] = !isCollapsed;
			});

			const source = document.createElement("a");
			source.href = collection.source;
			source.target = "_blank";
			source.rel = "noopener noreferrer";
			source.textContent = "Fuente";

			source.addEventListener("click", event => {
				event.stopPropagation();
			});

			header.append(toggle, source);
			section.append(header);

			// CONTENIDO DESPLEGABLE

			const content = document.createElement("div");
			content.className = "group-content";

			const inner = document.createElement("div");
			inner.className = "group-content-inner";

			for (const medal of rows) {
				const row = document.createElement("div");
				row.className = "medal-row";

				row.append(makeImage(medal));

				const info = document.createElement("span");
				info.className = "medal-info";

				const name = document.createElement("span");
				name.className = "medal-name";
				name.textContent = medal.name;

				const ref = document.createElement("span");
				ref.className = "medal-ref";

				ref.textContent = medal.reference
					? `Ref. ${medal.reference}`
					: "Referencia pendiente";

				info.append(
					name,
					document.createElement("br"),
					ref
				);

				row.append(info, makeControls(medal));

				inner.append(row);
			}

			content.append(inner);
			section.append(content);

			container.append(section);
		}

		if (!shown) {
			const empty = document.createElement("div");

			empty.className = "empty";
			empty.textContent =
				"No hay medallas que coincidan con los filtros.";

			container.append(empty);
		}

		updateSummary();
	}

	// ============================================================
	// INICIALIZACIÓN
	// ============================================================

	function init() {
		loadOwnership();

		addModalStyles();
		createModal();
		createSortControl();

		const select = $("collection-filter");

		for (const collection of catalogue.collections) {
			const option = document.createElement("option");

			option.value = collection.id;
			option.textContent = collection.name;

			select.append(option);
		}

		select.addEventListener("change", render);
		$("search").addEventListener("input", render);

		document.querySelectorAll("[data-filter]").forEach(button => {
			button.addEventListener("click", () => {
				activeFilter = button.dataset.filter;

				document.querySelectorAll("[data-filter]").forEach(b => {
					b.classList.toggle("active", b === button);
				});

				render();
			});
		});

		// EXPORTACIÓN

		$("export-button").addEventListener("click", () => {
			const data = {
				version: 2,
				exportedAt: new Date().toISOString(),
				ownership,
				duplicates
			};

			const url = URL.createObjectURL(
				new Blob(
					[JSON.stringify(data, null, 2)],
					{ type: "application/json" }
				)
			);

			const a = document.createElement("a");

			a.href = url;
			a.download = "mi-coleccion-yokai.json";
			a.click();

			URL.revokeObjectURL(url);
		});

		// IMPORTACIÓN

		$("import-button").addEventListener("click", () => {
			$("import-file").click();
		});

		$("import-file").addEventListener("change", async event => {
			const file = event.target.files[0];

			if (!file) return;

			try {
				const data = JSON.parse(await file.text());

				if (
					!data.ownership ||
					typeof data.ownership !== "object"
				) {
					throw new Error("Formato incorrecto");
				}

				ownership = data.ownership;

				duplicates =
					data.duplicates &&
					typeof data.duplicates === "object"
						? data.duplicates
						: {};

				saveOwnership();
				saveDuplicates();

				render();

			} catch (_) {
				alert("No se ha podido importar el archivo JSON.");
			}

			event.target.value = "";
		});

		render();
	}

	// ============================================================
	// CARGA DEL CATÁLOGO
	// ============================================================

	fetch("data/catalogo.json")
		.then(response => {
			if (!response.ok) {
				throw new Error("No se pudo cargar el catálogo");
			}

			return response.json();
		})
		.then(data => {
			catalogue = data;
			document.title = data.title;
			init();
		})
		.catch(error => {
			$("catalogue").innerHTML =
				'<div class="empty">No se ha podido cargar data/catalogo.json. Abre la aplicación desde la carpeta del proyecto o mediante un servidor local.</div>';

			console.error(error);
		});

})();
