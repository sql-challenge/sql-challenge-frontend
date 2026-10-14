import Link from "next/link"
import { Header } from "@/_components/_organisms/header"
import { Button } from "@/_components/_atoms/button"
import { Badge } from "@/_components/_atoms/badge"
import PixelHero from "@/_components/_organisms/pixelHero"
import { HeroCta } from "@/_components/_atoms/heroCta"
import { TerminalEditor } from "@/_components/_molecules/terminalEditor"
import { Reveal } from "@/_components/_atoms/reveal"
import { Activity, Award, BookOpen, Clipboard, Terminal } from "feather-icons-react"

export default function HomePage() {
  return (
    <div className="h-full relative flex flex-col gap-y-16">
      <Header />
      <PixelHero />
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl sm:mt-12 mt-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Reveal direction="up" className="relative z-10 text-center space-y-8">
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
        </Reveal>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
        <div className="border-2 border-border bg-card shadow-pixel md:grid md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-border/60">
          <Reveal direction="up" delay={0}>
            <div className="p-5 sm:p-6 h-full">
              <div className="mb-4 flex items-center justify-center w-10 h-10 bg-primary/10 border-2 border-primary/30">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 font-display tracking-wide">Aprendizado através de Histórias</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Resolva mistérios de SQL por meio de histórias de detetive envolventes que tornam o aprendizado divertido e memorável.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <div className="p-5 sm:p-6 h-full">
              <div className="mb-4 flex items-center justify-center w-10 h-10 bg-accent/10 border-2 border-accent/30">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2 font-display tracking-wide">Progresso Gamificado</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Ganhe XP, desbloqueie conquistas e suba no ranking enquanto domina conceitos de SQL.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <div className="p-5 sm:p-6 h-full">
              <div className="mb-4 flex items-center justify-center w-10 h-10 bg-success/10 border-2 border-success/30">
                <Terminal className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-lg font-bold mb-2 font-display tracking-wide">Prática Mão na Massa</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Escreva consultas SQL reais em nosso editor interativo com feedback instantâneo e dicas.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
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
              Icon: Clipboard,
              title: "Receba o Caso",
              description: "Cada mistério traz uma história detective e um objetivo SQL claro. Você sabe exatamente o que precisa descobrir.",
            },
            {
              step: "02",
              Icon: Terminal,
              title: "Interrogue os Dados",
              description: "Escreva consultas SQL no editor interativo com feedback instantâneo. Errou? Receba dicas e tente de novo sem medo.",
            },
            {
              step: "03",
              Icon: Award,
              title: "Resolva & Evolua",
              description: "Consulta certa? Ganhe XP, destrave conquistas e suba no ranking. Cada caso resolvido te prepara para o próximo nível.",
            },
          ].map((item, index) => (
            <Reveal key={item.step} direction="up" delay={index * 150}>
              <div className="relative border-2 border-border bg-card p-5 shadow-pixel hover:border-primary/60 transition-colors flex flex-col h-full">
                <span className="absolute top-3 right-3 text-xs font-mono font-bold text-muted-foreground border-2 border-border/60 px-1.5 py-0.5 select-none tabular-nums">
                  {item.step}
                </span>
                <div className="mb-4 flex items-center justify-center w-10 h-10 bg-primary/10 border-2 border-primary/30">
                  <item.Icon className="h-5 w-5 text-primary" />
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
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
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
                  <Activity className="h-5 w-5" />
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
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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
        <footer className="border-t-2 border-border mt-16">
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