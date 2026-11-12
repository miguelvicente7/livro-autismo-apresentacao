"use client";

import dynamic from "next/dynamic";

const BookReader = dynamic(() => import("@/components/BookReader"), {
  ssr: false,
  loading: () => (
    <div className="book-root" aria-busy="true">
      <header className="book-header">
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: "4%" }} />
        </div>
        <span className="page-indicator">Capa</span>
      </header>
      <div className="stage">
        <div className="book-shell">
          <div className="book-spine" />
          <main className="book">
            <section className="page cover active" data-title="Capa">
              <div className="page-face">
                <p className="cover-author">Autor Miguel Vicente</p>
                <div className="cover-inner">
                  <p className="cover-series">Guia de Acolhimento e Inclusão</p>
                  <h1>
                    Como Acolher
                    <br />
                    Pessoas com Autismo
                  </h1>
                  <p className="cover-subtitle">Carregando o livro…</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  ),
});

export default function BookReaderClient() {
  return <BookReader />;
}
