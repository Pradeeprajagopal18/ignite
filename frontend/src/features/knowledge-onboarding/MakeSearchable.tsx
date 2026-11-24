import { useRef, useState } from 'react'
import { api } from '../../api'
import { ErrorLine } from '../../components'

const ACCEPTED_FILES = '.pdf,.docx,.md,.markdown,.html,.htm,.txt,.rst,.adoc'

export function MakeSearchable({ ws, onOpen }: { ws: string; onOpen: (id: string) => void }) {
  const [groups, setGroups] = useState('')
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [selected, setSelected] = useState<boolean[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const sourceId = useRef<string | null>(null)
  const included = files.filter((_, index) => selected[index])

  async function publish() {
    setBusy(true)
    setError('')
    try {
      if (!sourceId.current) {
        const allowedGroups = groups.split(',').map(group => group.trim()).filter(Boolean)
        const source = await api.addSource(ws, {
          name: name.trim() || included[0].name.replace(/\.[^.]+$/, ''),
          kind: 'upload',
          config: {},
          audience: allowedGroups.length ? 'some' : 'everyone',
          users: [],
          teams: [],
          groups: allowedGroups,
          agents: [],
          project_id: null,
          enabled: true,
          sync_hours: 0,
        })
        sourceId.current = source.id
      }

      const { results } = await api.uploadFiles(sourceId.current, included)
      const failed = results.flatMap(result => result.error ? [result] : [])
      if (failed.length) {
        setError(failed.map(result => `${result.file}: ${result.error}`).join('\n'))
        setFiles(included.filter((_, index) => Boolean(results[index]?.error)))
        setSelected(failed.map(() => true))
        return
      }
      onOpen(sourceId.current)
    } catch (cause) {
      setError(String(cause).replace(/^Error: (\d{3}: )?/, ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h3>Make files searchable</h3>
      <p className="muted small">
        Ignite uses the text from all selected files by default. Search by meaning uses your workspace’s embedding settings.
      </p>
      <div className="settings-grid">
        <label className="setting">Source name (optional)
          <input value={name} disabled={busy || Boolean(sourceId.current)} onChange={event => setName(event.target.value)} />
        </label>
        <label className="setting">Limit access to directory or SSO groups (optional)
          <input value={groups} disabled={busy || Boolean(sourceId.current)} onChange={event => setGroups(event.target.value)} />
          <span className="muted small">Enter comma-separated groups. Leave blank to share with everyone in the workspace.</span>
        </label>
        <label className="setting">Files
          <input type="file" multiple accept={ACCEPTED_FILES} disabled={busy} onChange={event => {
            const picked = Array.from(event.target.files ?? [])
            setFiles(picked)
            setSelected(picked.map(() => true))
            setError('')
          }} />
          <span className="muted small">PDF, Word, Markdown, HTML, and text, up to 25 MB per file.</span>
        </label>
      </div>
      {files.length > 0 && <details>
        <summary>Edit selection ({included.length} of {files.length} files)</summary>
        <ul className="plain">
          {files.map((file, index) => <li key={index}>
            <label className="check">
              <input type="checkbox" checked={selected[index]} disabled={busy} onChange={event => {
                const checked = event.target.checked
                setSelected(current => current.map((value, i) => i === index ? checked : value))
              }} />
              {file.name}
            </label>
          </li>)}
        </ul>
      </details>}
      <ErrorLine error={error} />
      <div className="row">
        <button disabled={busy || included.length === 0} onClick={publish}>
          {busy ? 'Making searchable…' : 'Make searchable'}
        </button>
        {sourceId.current && !busy && <button className="secondary" onClick={() => {
          if (sourceId.current) onOpen(sourceId.current)
        }}>Open source</button>}
      </div>
    </section>
  )
}
