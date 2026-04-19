<script lang="ts">
  import type { Indexer } from '@/lib/data/indexerStructure';
  import type { FiltersState } from '@/lib/stores/filters';
  import { filters, resetFilters } from '@/lib/stores/filters';
  import { langStore, strings } from '@/lib/i18n';

  export let allRows: Indexer[] = [];

  const languageNames: Record<string, string> = {
    EN: 'English',
    DE: 'German',
    ES: 'Spanish',
    FR: 'French',
    NL: 'Dutch',
    TR: 'Turkish',
    VI: 'Vietnamese',
    AR: 'Arabic',
  };

  // Build language options dynamically from all rows (2-letter language codes only).
  function langsFromContent(content?: string): string[] {
    if (!content) return [];

    const blacklist = new Set(['NO', 'TO', 'BE', 'TV', 'HD', 'XX', 'OR', 'IT', 'ON']);
    const codes = content.toUpperCase().match(/\b[A-Z]{2}\b/g) ?? [];
    return Array.from(new Set(codes.filter((code) => !blacklist.has(code))));
  }

  function languageLabel(code: string): string {
    const normalized = code.toUpperCase();
    const name = languageNames[normalized];
    return name ? `${name} (${normalized})` : normalized;
  }

  $: languageOptions = Array.from(new Set(allRows.flatMap((r) => langsFromContent(r.content))))
    .filter(Boolean)
    .sort((a, b) => languageLabel(a).localeCompare(languageLabel(b)));

  // Subscribe reactively to the store (Svelte auto-subscription)
  let f: FiltersState;
  $: f = $filters;

  // Count active filters
  $: activeCount =
    (f.apiMode !== 'any' ? 1 : 0) +
    (f.nzbMode !== 'any' ? 1 : 0) +
    (f.language !== 'any' ? 1 : 0) +
    (f.lifetimeOnly ? 1 : 0) +
    (f.freeOnly ? 1 : 0) +
    (f.supportsCrypto ? 1 : 0);

  let open = false;

  // Helpers to coerce number inputs
  function toNumOrNull(v: string): number | null {
    if (v === '' || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
</script>

<div class="collapse-arrow bg-base-200 border-accent collapse mb-4">
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title text-md flex items-center justify-between font-medium">
    <span>{strings[$langStore].filters.title}</span>
    {#if activeCount > 0}
      <span class="badge badge-primary badge-sm">{activeCount}</span>
    {/if}
  </div>

  <div class="collapse-content">
    <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <!-- API/Day -->
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">{strings[$langStore].filters.apiPerDay}</span>
        </div>
        <select
          class="select select-bordered w-full"
          value={f.apiMode}
          on:change={(e) => {
            const v = (e.currentTarget as HTMLSelectElement).value as FiltersState['apiMode'];
            filters.update((x) => ({ ...x, apiMode: v, minApi: v === 'min' ? (x.minApi ?? 0) : x.minApi }));
          }}
        >
          <option value="any">{strings[$langStore].filters.any}</option>
          <option value="min">{strings[$langStore].filters.minApi}</option>
          <option value="unlimited">{strings[$langStore].labels.unlimited}</option>
        </select>
        {#if f.apiMode === 'min'}
          <input
            type="number"
            class="input input-bordered mt-2 w-full"
            inputmode="numeric"
            min="0"
            placeholder="1000"
            on:input={(e) => {
              const v = (e.currentTarget as HTMLInputElement).value;
              filters.update((x) => ({ ...x, minApi: toNumOrNull(v) }));
            }}
            value={f.minApi ?? ''}
          />
        {/if}
      </label>

      <!-- NZB/Day -->
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">{strings[$langStore].filters.nzbPerDay}</span>
        </div>
        <select
          class="select select-bordered w-full"
          value={f.nzbMode}
          on:change={(e) => {
            const v = (e.currentTarget as HTMLSelectElement).value as FiltersState['nzbMode'];
            filters.update((x) => ({ ...x, nzbMode: v, minNzb: v === 'min' ? (x.minNzb ?? 0) : x.minNzb }));
          }}
        >
          <option value="any">{strings[$langStore].filters.any}</option>
          <option value="min">{strings[$langStore].filters.minNzb}</option>
          <option value="unlimited">{strings[$langStore].labels.unlimited}</option>
        </select>
        {#if f.nzbMode === 'min'}
          <input
            type="number"
            class="input input-bordered mt-2 w-full"
            inputmode="numeric"
            min="0"
            placeholder="100"
            on:input={(e) => {
              const v = (e.currentTarget as HTMLInputElement).value;
              filters.update((x) => ({ ...x, minNzb: toNumOrNull(v) }));
            }}
            value={f.minNzb ?? ''}
          />
        {/if}
      </label>

      <!-- Language -->
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">{strings[$langStore].filters.language}</span>
        </div>
        <select
          class="select select-bordered w-full"
          value={f.language}
          on:change={(e) => {
            const v = (e.currentTarget as HTMLSelectElement).value;
            filters.update((x) => ({ ...x, language: v }));
          }}
        >
          <option value="any">{strings[$langStore].filters.any}</option>
          {#each languageOptions as code}
            <option value={code}>{languageLabel(code)}</option>
          {/each}
        </select>
      </label>

      <!-- Lifetime only -->
      <label class="label flex cursor-pointer gap-2">
        <input
          type="checkbox"
          class="checkbox"
          checked={f.lifetimeOnly}
          on:change={(e) => {
            const v = (e.currentTarget as HTMLInputElement).checked;
            filters.update((x) => ({ ...x, lifetimeOnly: v }));
          }}
        />
        <span class="label-text">{strings[$langStore].filters.lifetimeOnly}</span>
      </label>

      <!-- Free only -->
      <label class="label flex cursor-pointer gap-2">
        <input
          type="checkbox"
          class="checkbox"
          checked={f.freeOnly}
          on:change={(e) => {
            const v = (e.currentTarget as HTMLInputElement).checked;
            filters.update((x) => ({ ...x, freeOnly: v }));
          }}
        />
        <span class="label-text">{strings[$langStore].filters.freeOnly}</span>
      </label>

      <!-- Supports crypto -->
      <label class="label flex cursor-pointer gap-2">
        <input
          type="checkbox"
          class="checkbox"
          checked={f.supportsCrypto}
          on:change={(e) => {
            const v = (e.currentTarget as HTMLInputElement).checked;
            filters.update((x) => ({ ...x, supportsCrypto: v }));
          }}
        />
        <span class="label-text">{strings[$langStore].filters.supportsCrypto}</span>
      </label>
    </div>

    <div class="mt-4">
      <button class="btn btn-sm" on:click={resetFilters}>
        {strings[$langStore].filters.clear}
      </button>
    </div>
  </div>
</div>
