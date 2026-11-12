export default function BookPages() {
  return (
    <>


    {/* CAPA */}
    <section className="page cover" data-title="Capa">
      <div className="page-face">
        <p className="cover-author">Autor Miguel Vicente</p>
        <div className="cover-inner">
          <p className="cover-series">Guia de Acolhimento e Inclusão</p>
          <h1>Como Acolher<br />Pessoas com Autismo</h1>
          <p className="cover-subtitle">Um livro digital com 25 capítulos para compreender, respeitar e apoiar pessoas no espectro autista</p>
          <div className="cover-line"></div>
          <p className="cover-meta">Para famílias, educadores, profissionais e a sociedade</p>
          <button className="btn-start" id="btn-start">Começar a leitura →</button>
        </div>
      </div>
    </section>

    {/* 1 */}
    <section className="page" data-title="1. O que é o autismo">
      <span className="chapter-num">Capítulo 1</span>
      <h2>O que é o autismo</h2>
      <p className="lead drop-cap">O Transtorno do Espectro Autista (TEA) é uma condição do neurodesenvolvimento que influencia a forma como a pessoa percebe o mundo, se comunica e se relaciona.</p>
      <p>Não é doença a ser “curada”. É uma <span className="mark">diferença neurológica</span> — uma maneira distinta de processar informações, emoções e estímulos. Cada pessoa autista é única.</p>
      <div className="callout">
        <strong>Lembre-se</strong>
        <p>Nem toda pessoa autista evita contato visual. O que une o espectro é a necessidade de ambientes previsíveis, comunicação clara e respeito à autonomia.</p>
      </div>
      <blockquote>“Se você conheceu uma pessoa autista, você conheceu uma pessoa autista.”</blockquote>
      <p className="cite">— ditado comum na comunidade</p>
    </section>

    {/* 2 */}
    <section className="page" data-title="2. Mitos e verdades">
      <span className="chapter-num">Capítulo 2</span>
      <h2>Mitos e verdades</h2>
      <div className="myth-grid">
        <article className="myth-card">
          <span className="badge badge-myth">Mito</span>
          <p>Autismo é causado por vacinas.</p>
          <span className="badge badge-truth">Verdade</span>
          <p>Estudos rigorosos descartaram qualquer ligação.</p>
        </article>
        <article className="myth-card">
          <span className="badge badge-myth">Mito</span>
          <p>Pessoas autistas não sentem empatia.</p>
          <span className="badge badge-truth">Verdade</span>
          <p>Muitas sentem empatia intensa; muda a forma de expressá-la.</p>
        </article>
        <article className="myth-card">
          <span className="badge badge-myth">Mito</span>
          <p>Crise é “birra” ou falta de educação.</p>
          <span className="badge badge-truth">Verdade</span>
          <p>Costuma ser sobrecarga sensorial ou dificuldade de comunicação.</p>
        </article>
        <article className="myth-card">
          <span className="badge badge-myth">Mito</span>
          <p>Só crianças são autistas.</p>
          <span className="badge badge-truth">Verdade</span>
          <p>Autistas crescem, trabalham, amam e precisam de apoio.</p>
        </article>
      </div>
    </section>

    {/* 3 */}
    <section className="page" data-title="3. O espectro">
      <span className="chapter-num">Capítulo 3</span>
      <h2>Entendendo o espectro</h2>
      <p className="lead">O termo “espectro” indica <em>variação</em> — não uma escada de valor humano.</p>
      <div className="key-questions">
        <p>O melhor caminho é perguntar e observar:</p>
        <ol className="questions">
          <li>O que essa pessoa precisa <strong>agora</strong>?</li>
          <li>O que a deixa <strong>segura</strong>?</li>
          <li>O que a <strong>sobrecarrega</strong>?</li>
        </ol>
      </div>
      <aside className="note">
        Evite rótulos como “alto” ou “baixo funcionamento”: eles escondem dificuldades e competências reais.
      </aside>
    </section>

    {/* 4 */}
    <section className="page" data-title="4. Comunicação">
      <span className="chapter-num">Capítulo 4</span>
      <h2>Comunicação clara e respeitosa</h2>
      <p>Comunique-se de forma <strong>direta</strong>. Evite ironias e metáforas sem contexto.</p>
      <h3 className="subhead">Pratique assim</h3>
      <ol className="steps">
        <li><span>1</span> Fale um pedido de cada vez.</li>
        <li><span>2</span> Dê tempo para processar — o silêncio não é ausência de resposta.</li>
        <li><span>3</span> Valide cartões, apps, gestos e escrita.</li>
        <li><span>4</span> Não force contato visual.</li>
      </ol>
      <p className="tip">A ecolalia (repetir frases) pode ser forma de processar ou se comunicar — não “imitação vazia”.</p>
    </section>

    {/* 5 */}
    <section className="page" data-title="5. Sensorial">
      <span className="chapter-num">Capítulo 5</span>
      <h2>O mundo sensorial</h2>
      <p className="lead">Um ambiente “normal” para você pode ser <span className="mark">ensurdecedor ou doloroso</span> para alguém no espectro.</p>
      <h3 className="subhead">Gatilhos comuns</h3>
      <ul className="chip-list">
        <li>Luzes fluorescentes</li>
        <li>Multidões</li>
        <li>Cheiro forte</li>
        <li>Etiquetas na roupa</li>
        <li>Barulho constante</li>
      </ul>
      <div className="callout callout-soft">
        <strong>O que oferecer</strong>
        <p>Óculos de sol, fones, espaços quietos e avisos antes de mudanças sensoriais. Pergunte o que ajuda.</p>
      </div>
    </section>

    {/* 6 */}
    <section className="page" data-title="6. Rotina e previsibilidade">
      <span className="chapter-num">Capítulo 6</span>
      <h2>Rotina e previsibilidade</h2>
      <p>A previsibilidade reduz ansiedade. Mudanças bruscas podem desorganizar profundamente.</p>
      <div className="definition">
        <span className="definition-term">Rotina</span>
        <p>Não é rigidez sem sentido: é <strong>âncora de segurança</strong>. Flexibilidade se ensina com cuidado — nunca com pressão.</p>
      </div>
      <ul className="plain-list">
        <li>→ Avise com antecedência</li>
        <li>→ Use agendas visuais, fotos ou apps</li>
        <li>→ Explique o “porquê” da mudança</li>
        <li>→ Ofereça tempo de adaptação</li>
      </ul>
    </section>

    {/* 7 */}
    <section className="page" data-title="7. Crises e meltdowns">
      <span className="chapter-num">Capítulo 7</span>
      <h2>Crises, meltdowns e shutdowns</h2>
      <div className="duo">
        <div className="duo-card">
          <h3>Meltdown</h3>
          <p>Sobrecarga intensa — <em>não</em> é birra.</p>
        </div>
        <div className="duo-card">
          <h3>Shutdown</h3>
          <p>Retração: a pessoa se fecha ou para de responder.</p>
        </div>
      </div>
      <h3 className="subhead">No pico da crise</h3>
      <ol className="steps">
        <li><span>1</span> Reduza luz, barulho e pessoas</li>
        <li><span>2</span> Fale pouco, com voz calma</li>
        <li><span>3</span> Garanta segurança sem violência</li>
        <li><span>4</span> Depois, converse sem culpa</li>
      </ol>
      <p className="pull">Punir ensina medo. Acolher ensina confiança.</p>
    </section>

    {/* 8 */}
    <section className="page" data-title="8. Stimming">
      <span className="chapter-num">Capítulo 8</span>
      <h2>Stimming: movimentos e autorregulação</h2>
      <p className="lead drop-cap">Balançar o corpo, abanar as mãos, repetir sons, girar objetos — o <em>stimming</em> ajuda a regular emoções e sensores.</p>
      <aside className="note note-accent">Não é “mania feia”. É estratégia de regulação.</aside>
      <p>Só intervenha se houver <strong>risco real</strong>. Forçar a parar o stimming seguro pode aumentar a ansiedade.</p>
      <p className="pull">Respeito ao corpo é respeito à pessoa.</p>
    </section>

    {/* 9 */}
    <section className="page" data-title="9. Família">
      <span className="chapter-num">Capítulo 9</span>
      <h2>O papel da família</h2>
      <p>Famílias são, muitas vezes, o primeiro e mais constante suporte. O esgotamento parental é real.</p>
      <ul className="checklist">
        <li>Priorize vínculo sobre “treino incessante”</li>
        <li>Celebre progressos no ritmo da pessoa</li>
        <li>Busque grupos de apoio e direitos (BPC, leis)</li>
        <li>Escolha profissionais éticos, sem milagres</li>
        <li>Ofereça escuta também aos irmãos</li>
      </ul>
    </section>

    {/* 10 */}
    <section className="page" data-title="10. Escola">
      <span className="chapter-num">Capítulo 10</span>
      <h2>Inclusão na escola</h2>
      <p className="lead">Inclusão de verdade <strong>não é só “estar na sala”</strong>. É participar com apoio.</p>
      <div className="tag-cloud">
        <span>Adaptações</span>
        <span>Tempo extra</span>
        <span>Materiais visuais</span>
        <span>Sala de recursos</span>
        <span>Formação docente</span>
        <span>Combate ao bullying</span>
      </div>
      <div className="callout">
        <strong>PEI</strong>
        <p>O plano individualizado deve ser feito com a família e, quando possível, com o próprio aluno.</p>
      </div>
    </section>

    {/* 11 */}
    <section className="page" data-title="11. Trabalho">
      <span className="chapter-num">Capítulo 11</span>
      <h2>Trabalho e vida adulta</h2>
      <p>Adultos autistas podem e devem ter estudo, emprego e vida independente — com ajustes razoáveis.</p>
      <h3 className="subhead">Ajustes que ajudam</h3>
      <ul className="chip-list">
        <li>Instruções escritas</li>
        <li>Horários previsíveis</li>
        <li>Espaço quieto</li>
        <li>Feedback claro</li>
      </ul>
      <aside className="note">Entrevistas que exigem “vender-se” excluem talentos. Avalie competência, não performance social.</aside>
    </section>

    {/* 12 */}
    <section className="page" data-title="12. Linguagem">
      <span className="chapter-num">Capítulo 12</span>
      <h2>Linguagem que dignifica</h2>
      <p>Prefira “pessoa autista” ou “pessoa com autismo” conforme a preferência de cada um.</p>
      <div className="warn-box">
        <strong>Evite</strong>
        <ul>
          <li>Termos pejorativos ou infantilizantes</li>
          <li>Falar da pessoa na 3ª pessoa na frente dela</li>
          <li>“Inspiração” forçada como espetáculo</li>
        </ul>
      </div>
      <p className="pull">Palavras moldam atitude. Atitude molda acesso.</p>
    </section>

    {/* 13 */}
    <section className="page" data-title="13. Consentimento e autonomia">
      <span className="chapter-num">Capítulo 13</span>
      <h2>Consentimento e autonomia</h2>
      <p className="lead">Pessoas autistas — crianças e adultas — têm direito a decidir sobre o próprio corpo.</p>
      <div className="definition">
        <span className="definition-term">Autonomia</span>
        <p>Não é abandono: é apoio que <strong>amplia</strong>, em vez de substituir, a vontade da pessoa.</p>
      </div>
      <ol className="questions">
        <li>Observe preferências</li>
        <li>Ofereça escolhas simples</li>
        <li>Respeite o “não”</li>
      </ol>
    </section>

    {/* 14 */}
    <section className="page" data-title="14. Terapias éticas">
      <span className="chapter-num">Capítulo 14</span>
      <h2>Terapias e apoios éticos</h2>
      <p>Priorize qualidade de vida, comunicação e bem-estar — não a “normalização” a qualquer custo.</p>
      <div className="duo">
        <div className="duo-card good">
          <h3>Busque</h3>
          <p>TO, fono, psicologia e educação especial alinhadas à pessoa.</p>
        </div>
        <div className="duo-card bad">
          <h3>Desconfie</h3>
          <p>“Cura milagrosa” e abordagens baseadas em humilhação.</p>
        </div>
      </div>
      <p className="tip">O objetivo não é apagar o autismo. É viver melhor, com menos sofrimento evitável.</p>
    </section>

    {/* 15 */}
    <section className="page" data-title="15. Amizades e social">
      <span className="chapter-num">Capítulo 15</span>
      <h2>Amizade e vida social</h2>
      <p className="lead drop-cap">Socializar não precisa seguir o modelo neurotípico. Interesses intensos podem ser pontes de amizade.</p>
      <ul className="plain-list">
        <li>→ Grupos pequenos</li>
        <li>→ Ambientes estruturados</li>
        <li>→ Hobbies compartilhados</li>
      </ul>
      <aside className="note note-accent">O “masking” constante está ligado a ansiedade e esgotamento.</aside>
      <p className="pull">Amizade verdadeira aceita o ritmo do outro.</p>
    </section>

    {/* 16 */}
    <section className="page" data-title="16. Saúde">
      <span className="chapter-num">Capítulo 16</span>
      <h2>Cuidados de saúde</h2>
      <p>Consultas podem ser aterrorizantes: cheiros, espera, toque, instruções vagas.</p>
      <h3 className="subhead">Prepare com carinho</h3>
      <ol className="steps">
        <li><span>1</span> Explique o passo a passo</li>
        <li><span>2</span> Use histórias sociais</li>
        <li><span>3</span> Permita objetos de conforto</li>
      </ol>
      <div className="callout callout-soft">
        <strong>Para profissionais</strong>
        <p>Falem com a pessoa, adaptem o ritmo e levem a sério dores comunicadas de forma atípica.</p>
      </div>
    </section>

    {/* 17 */}
    <section className="page" data-title="17. Segurança">
      <span className="chapter-num">Capítulo 17</span>
      <h2>Segurança no dia a dia</h2>
      <p>Ensine regras <strong>concretas</strong>: atravessar a rua, falar com estranhos, usar transporte.</p>
      <ul className="checklist">
        <li>Planos para elopement (sair correndo)</li>
        <li>Portas, supervisão e rotas conhecidas</li>
        <li>Identificação em emergência — só se desejarem</li>
      </ul>
      <aside className="note">Segurança nunca justifica isolamento permanente sem qualidade de vida.</aside>
    </section>

    {/* 18 */}
    <section className="page" data-title="18. Interesses especiais">
      <span className="chapter-num">Capítulo 18</span>
      <h2>Interesses intensos</h2>
      <p className="lead">Trens, mapas, música, jogos, animais — não são “obsessão a eliminar”.</p>
      <p className="pull">São fonte de alegria, aprendizado e identidade.</p>
      <div className="callout">
        <strong>Use como ponte</strong>
        <p>Para ensinar, motivar e conectar. Limite o tempo com carinho quando preciso — sem ridicularizar.</p>
      </div>
    </section>

    {/* 19 */}
    <section className="page" data-title="19. Emocões">
      <span className="chapter-num">Capítulo 19</span>
      <h2>Emoções e autorregulação</h2>
      <p>Nomear emoções ajuda. Escalas de humor, pausas e espaços de calma são aliados.</p>
      <div className="warn-box soft">
        <strong>Não diga</strong>
        <p>“Não é para tanto.” O limiar sensorial é diferente — minimizar raramente ajuda.</p>
      </div>
      <ul className="chip-list">
        <li>Respiração</li>
        <li>Movimento</li>
        <li>Objeto sensorial</li>
        <li>Presença calma</li>
      </ul>
    </section>

    {/* 20 */}
    <section className="page" data-title="20. Comunidade">
      <span className="chapter-num">Capítulo 20</span>
      <h2>Comunidade e direitos</h2>
      <p>No Brasil, leis reconhecem direitos de pessoas com deficiência, incluindo autistas.</p>
      <div className="law-cards">
        <div className="law-card">
          <span>Lei 12.764/2012</span>
          <p>Lei Berenice Piana</p>
        </div>
        <div className="law-card">
          <span>Lei 13.146/2015</span>
          <p>Estatuto da Pessoa com Deficiência</p>
        </div>
      </div>
      <p className="tip">Direitos existem no papel — a luta cotidiana é fazê-los valer. Ouça a comunidade autista.</p>
    </section>

    {/* 21 */}
    <section className="page" data-title="21. Irmãos e pares">
      <span className="chapter-num">Capítulo 21</span>
      <h2>Irmãos, amigos e colegas</h2>
      <p className="lead">Crianças e adolescentes neurotípicos também precisam de orientação.</p>
      <ul className="plain-list">
        <li>→ Como brincar juntos</li>
        <li>→ O que não forçar</li>
        <li>→ Quando pedir ajuda a um adulto</li>
      </ul>
      <aside className="note note-accent">Não transforme o irmão em “cuidador permanente”. Ofereça tempo individual e espaço sem culpa.</aside>
    </section>

    {/* 22 */}
    <section className="page" data-title="22. Transições">
      <span className="chapter-num">Capítulo 22</span>
      <h2>Transições da vida</h2>
      <p>Escola, mudança de casa, adolescência, emprego, luto — toda transição pede planejamento extra.</p>
      <ol className="steps">
        <li><span>1</span> Visitas prévias</li>
        <li><span>2</span> Fotos do novo ambiente</li>
        <li><span>3</span> Ensaios de roteiro</li>
        <li><span>4</span> Objetos familiares na mala</li>
      </ol>
      <p className="pull">Ninguém “supera” a previsibilidade só porque envelheceu.</p>
    </section>

    {/* 23 */}
    <section className="page" data-title="23. O que evitar">
      <span className="chapter-num">Capítulo 23</span>
      <h2>O que evitar</h2>
      <ul className="avoid-list">
        <li><span>✕</span> Gritar, humilhar ou castigar fisicamente</li>
        <li><span>✕</span> Comparar com irmãos ou colegas</li>
        <li><span>✕</span> Ignorar a dor (“é frescura”)</li>
        <li><span>✕</span> Prometer cura ou terapias perigosas</li>
        <li><span>✕</span> Expor em redes sem consentimento</li>
        <li><span>✕</span> Falar dela como se não estivesse presente</li>
      </ul>
      <p className="tip">O dano da exclusão emocional dura mais que qualquer “lição” mal aplicada.</p>
    </section>

    {/* 24 */}
    <section className="page" data-title="24. Práticas do dia a dia">
      <span className="chapter-num">Capítulo 24</span>
      <h2>Práticas do dia a dia</h2>
      <p className="lead">Checklist simples de acolhimento:</p>
      <ul className="checklist big">
        <li>Ambiente previsível e sensorialmente amigável</li>
        <li>Comunicação clara e respeito ao “não”</li>
        <li>Interesses valorizados; stimming permitido</li>
        <li>Avisos antes de mudanças; plano para crises</li>
        <li>Escuta da própria pessoa autista</li>
      </ul>
      <p className="pull">Pequenos gestos consistentes &gt; grandes discursos.</p>
    </section>

    {/* 25 */}
    <section className="page" data-title="25. Conclusão">
      <span className="chapter-num">Capítulo 25</span>
      <h2>Conclusão: acolher é escolher</h2>
      <p className="lead drop-cap">Acolher não exige perfeição. Exige disposição de aprender, desaprender estereótipos e ajustar o mundo — um pouco — para caber mais gente.</p>
      <blockquote>Inclusão não é favor. É direito — e é melhor para todos nós.</blockquote>
      <div className="end-matter">
        <p className="end-title">Fim</p>
        <p>Material educativo e de sensibilização. Não substitui avaliação clínica nem a voz da própria pessoa autista.</p>
        <p className="cover-meta" style={{marginTop: 12}}>Autor Miguel Vicente</p>
        <button className="btn-start" id="btn-toc">Ver sumário</button>
      </div>
    </section>

      
    </>
  );
}
