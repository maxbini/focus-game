# Git & GitHub — How To

## Clone

```bash
git clone git@github.com:maxbini/focus-game.git
cd focus-game
```

## Remote (SSH)

```bash
git remote -v
# origin  git@github.com:maxbini/focus-game.git (fetch)
# origin  git@github.com:maxbini/focus-game.git (push)
```

## Workflow

```bash
# 1. Modifica i file...

# 2. Stage delle modifiche
git add -A

# 3. Commit locale
git commit -m "tipo: descrizione breve"

# 4. Push su GitHub
git push
```

## Convenzioni commit

Usa il formato **Conventional Commits**:

| Prefisso | Quando |
|---|---|
| `feat:` | Nuova feature |
| `fix:` | Bug fix |
| `docs:` | Documentazione |
| `style:` | Solo CSS/styling |
| `refactor:` | Ristrutturazione codice |
| `security:` | Fix di sicurezza |
| `chore:` | Manutenzione (.gitignore, deps) |

Esempi:
```bash
git commit -m "feat: add spectator mode"
git commit -m "fix: prevent stack overflow on capture"
git commit -m "docs: update README with deploy link"
```

## Ramo

```bash
# Il ramo principale è `main`. Tutti i commit vanno su main.
git branch    # mostra il ramo corrente
```

## Stato

```bash
git status    # file modificati
git log --oneline -5   # ultimi 5 commit
```

## Deploy su Render

Render è collegato al repo GitHub. Ogni push su `main` triggera automaticamente il redeploy su https://focus-game-h85z.onrender.com

Non serve fare nulla dopo il push — Render si aggiorna da solo in ~1-2 minuti.
