import Link from "next/link"
import { Header } from "@/_components/_organisms/header"
import { Button } from "@/_components/_atoms/button"
import { Badge } from "@/_components/_atoms/badge"
import ThreeScene from "@/_components/_organisms/three-path"
import { HeroCta } from "@/_components/_atoms/heroCta"
import { TerminalEditor } from "@/_components/_molecules/terminalEditor"
import { Reveal } from "@/_components/_atoms/reveal"

export default function HomePage() {
  return (
    <div className="h-full relative flex flex-col gap-y-16">
      <Header />
      <ThreeScene />
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl sm:mt-12 mt-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Reveal direction="up" className="relative z-10 text-center space-y-8">
          <Badge variant="primary" className="text-sm border-2">
            A forma mais envolvente de aprender SQL
          </Badge>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight font-display tracking-tight">
            Aprenda SQL sem decorar
            <br />
            <span className="text-primary">
              Aprenda Investigando
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Desafios gamificados + Histórias de detetive + Feedback instantâneo.
            O método que torna SQL impossível de esquecer.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <HeroCta />
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="cursor-pointer">
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* Social Proof
  <div className="flex items-center justify-center gap-2 text-sm">
    <div className="flex -space-x-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-success border-2 border-background" />
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-warning border-2 border-background" />
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warning to-primary border-2 border-background flex items-center justify-center text-xs font-bold">
        +10k
      </div>
    </div>
    <span className="text-muted-foreground">
      Desenvolvedores já resolveram mais de <strong className="text-foreground">250k mistérios</strong>
    </span>
  </div> */}
        </Reveal>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 bg-background bg-pixel-grid">
        <div className="grid md:grid-cols-3 gap-6">
          <Reveal direction="up" delay={0}>
            <div className="flex flex-col h-full border-2 border-primary/40 bg-card p-5 shadow-pixel hover:border-primary transition-colors">
              <div className="mb-4 flex items-center justify-center w-10 h-10 bg-primary/10 border-2 border-primary/30">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 font-display tracking-wide">Aprendizado através de Histórias</h3>
              <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                Resolva mistérios de SQL por meio de histórias de detetive envolventes que tornam o aprendizado divertido e memorável.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <div className="flex flex-col h-full border-2 border-accent/40 bg-card p-5 shadow-pixel hover:border-accent transition-colors">
              <div className="mb-4 flex items-center justify-center w-10 h-10 bg-accent/10 border-2 border-accent/30">
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 font-display tracking-wide">Progresso Gamificado</h3>
              <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                Ganhe XP, desbloqueie conquistas e suba no ranking enquanto domina conceitos de SQL.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <div className="flex flex-col h-full border-2 border-success/40 bg-card p-5 shadow-pixel hover:border-success transition-colors">
              <div className="mb-4 flex items-center justify-center w-10 h-10 bg-success/10 border-2 border-success/30">
                <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 font-display tracking-wide">Prática Mão na Massa</h3>
              <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                Escreva consultas SQL reais em nosso editor interativo com feedback instantâneo e dicas.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 bg-background bg-pixel-grid">
        <div className="text-center space-y-4 mb-8 sm:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-wide">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Inspetor, o método é simples. Cada mistério segue três etapas.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: (
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              ),
              title: "Receba o Caso",
              description: "Cada mistério traz uma história detective e um objetivo SQL claro. Você sabe exatamente o que precisa descobrir.",
            },
            {
              step: "02",
              icon: (
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              ),
              title: "Interrogue os Dados",
              description: "Escreva consultas SQL no editor interativo com feedback instantâneo. Errou? Receba dicas e tente de novo sem medo.",
            },
            {
              step: "03",
              icon: (
                <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              ),
              title: "Resolva & Evolua",
              description: "Consulta certa? Ganhe XP, destrave conquistas e suba no ranking. Cada caso resolvido te prepara para o próximo nível.",
            },
          ].map((item, index) => (
            <Reveal key={item.step} direction="up" delay={index * 150}>
              <div className="relative border-2 border-border bg-card p-5 shadow-pixel hover:border-primary/60 transition-colors flex flex-col h-full">
                <span className="text-3xl font-bold font-display text-muted-foreground/20 absolute top-2 right-3 select-none">
                  {item.step}
                </span>
                <div className="mb-4 flex items-center justify-center w-10 h-10 bg-primary/10 border-2 border-primary/30">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 font-display tracking-wide">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm flex-1">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Terminal Editor */}
      <Reveal direction="fade" delay={100}>
        <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 bg-background bg-pixel-grid">
          <div className="text-center space-y-4 mb-6 sm:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-wide">
              Veja Como Funciona na Prática
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              SQLite - o editor roda 100% no seu navegador. Escreva SQL de verdade com resultados instantâneos.
            </p>
          </div>
          <TerminalEditor />
        </section>
      </Reveal>

      {/* Topics */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 bg-background bg-pixel-grid">
        <div className="text-center space-y-4 mb-8 sm:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-wide">
            O Que Você Vai Aprender
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Dos fundamentos ao avançado, sempre investigando.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "SELECT, WHERE, ORDER BY", level: "Iniciante", levelVariant: "success" },
            { name: "JOINs (INNER, LEFT, RIGHT)", level: "Intermediário", levelVariant: "warning" },
            { name: "GROUP BY, HAVING, Agregações", level: "Intermediário", levelVariant: "warning" },
            { name: "Subqueries e CTEs", level: "Avançado", levelVariant: "destructive" },
          ].map((topic, index) => (
            <Reveal key={topic.name} direction={index % 2 === 0 ? "left" : "right"} delay={index * 100}>
              <div className="border-2 border-border bg-card p-4 shadow-pixel-sm hover:border-primary/60 transition-colors flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 shrink-0 border-2 ${topic.levelVariant === "success" ? "bg-success/10 border-success/30 text-success" :
                    topic.levelVariant === "warning" ? "bg-warning/10 border-warning/30 text-warning" :
                      "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{topic.name}</p>
                  <Badge variant={topic.levelVariant as "success" | "warning" | "destructive"} className="mt-1">
                    {topic.level}
                  </Badge>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <Reveal direction="up">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 bg-background bg-pixel-grid">
          <div className="border-2 border-primary/40 bg-card p-6 sm:p-10 md:p-14 text-center shadow-pixel">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-wide mb-4">
              Pronto para Resolver seu Primeiro Caso?
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto text-balance mb-8">
              Junte-se a outros detetives de dados. Sem frescura. SQL puro e histórias que prendem.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <HeroCta />
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="cursor-pointer">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Footer */}
      <Reveal direction="fade" delay={100}>
        <footer className="border-t-2 border-border mt-16 bg-background bg-pixel-grid">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold font-display tracking-tight mb-2">
                  SQL CHALLENGE
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Aprenda SQL resolvendo mistérios. Uma plataforma gamificada para desenvolvedores que querem aprender na prática.
                </p>
              </div>
              <div className="ml-auto">
                <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/mystery" className="hover:text-foreground transition-colors">Mistérios</Link></li>
                  <li><Link href="/ranking" className="hover:text-foreground transition-colors">Ranking</Link></li>
                  <li><Link href="/conquistas" className="hover:text-foreground transition-colors">Conquistas</Link></li>
                </ul>
              </div>
              {/* <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Informações</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-default">Sobre</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-default">Termos de Uso</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-default">Contato</span></li>
              </ul>
            </div> */}
            </div>
            <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} SQL CHALLENGE. Feito para detetives de dados.
            </div>
          </div>
        </footer>
      </Reveal>
    </div>
  )
}