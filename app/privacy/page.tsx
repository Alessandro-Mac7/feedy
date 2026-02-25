import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Torna alla home
        </Link>

        <div className="glass rounded-3xl p-6 sm:p-8 space-y-8">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-foreground-muted">
              Ultimo aggiornamento: 25 febbraio 2026
            </p>
          </div>

          <Section title="1. Titolare del trattamento">
            <p>
              Il titolare del trattamento dei dati personali è il gestore
              dell&apos;applicazione Feedy. Per qualsiasi richiesta relativa
              alla privacy puoi scrivere a:{" "}
              <strong>privacy@feedy.app</strong>.
            </p>
          </Section>

          <Section title="2. Dati raccolti">
            <p>Feedy raccoglie e tratta i seguenti dati personali:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Dati di registrazione:</strong> nome, indirizzo email e
                password (criptata)
              </li>
              <li>
                <strong>Dati alimentari:</strong> diete, pasti, descrizioni
                degli alimenti, valori di macronutrienti (carboidrati, grassi,
                proteine), note
              </li>
              <li>
                <strong>Dati tecnici:</strong> cookie tecnici di sessione e dati
                in localStorage per il funzionamento dell&apos;app (es. tracker
                acqua, preferenze di consenso)
              </li>
            </ul>
          </Section>

          <Section title="3. Finalità e base giuridica">
            <p>I tuoi dati sono trattati per le seguenti finalità:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Erogazione del servizio</strong> (base giuridica:
                esecuzione del contratto) — gestione dell&apos;account,
                salvataggio e visualizzazione di diete e pasti
              </li>
              <li>
                <strong>Stima AI dei macronutrienti</strong> (base giuridica:
                consenso) — invio delle descrizioni degli alimenti a un servizio
                esterno di intelligenza artificiale per calcolare i valori
                nutrizionali stimati
              </li>
            </ul>
          </Section>

          <Section title="4. Trasferimento dati a terzi">
            <p>
              Quando utilizzi la funzione di <strong>stima AI dei macro</strong>,
              le descrizioni dei tuoi alimenti vengono inviate a{" "}
              <strong>Groq Inc.</strong> (con sede negli Stati Uniti) tramite la
              loro API per ottenere una stima dei macronutrienti.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                Vengono inviate <strong>solo le descrizioni degli alimenti</strong>,
                senza dati identificativi personali
              </li>
              <li>
                I dati sono utilizzati esclusivamente per generare la stima e
                non vengono conservati da Groq
              </li>
              <li>
                Il trasferimento verso gli USA avviene sulla base del tuo
                consenso esplicito, richiesto prima del primo utilizzo della
                funzione
              </li>
            </ul>
          </Section>

          <Section title="5. Periodo di conservazione">
            <p>
              I tuoi dati personali sono conservati per tutto il tempo in cui il
              tuo account è attivo. Puoi richiedere la cancellazione completa
              del tuo account e di tutti i dati associati in qualsiasi momento
              dalla pagina <strong>Impostazioni</strong> dell&apos;app.
            </p>
          </Section>

          <Section title="6. Diritti dell'interessato">
            <p>
              Ai sensi del Regolamento UE 2016/679 (GDPR), hai il diritto di:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Accesso:</strong> ottenere una copia dei tuoi dati
                personali
              </li>
              <li>
                <strong>Rettifica:</strong> correggere dati inesatti o
                incompleti
              </li>
              <li>
                <strong>Cancellazione:</strong> richiedere l&apos;eliminazione
                dei tuoi dati
              </li>
              <li>
                <strong>Portabilità:</strong> esportare i tuoi dati in formato
                leggibile (JSON)
              </li>
              <li>
                <strong>Revoca del consenso:</strong> ritirare il consenso alla
                stima AI in qualsiasi momento
              </li>
            </ul>
            <p className="mt-2">
              Puoi esercitare i diritti di accesso, portabilità e cancellazione
              direttamente dalla pagina <strong>Impostazioni</strong> dell&apos;app.
              Per altre richieste, scrivi a{" "}
              <strong>privacy@feedy.app</strong>.
            </p>
          </Section>

          <Section title="7. Cookie e localStorage">
            <p>
              Feedy utilizza esclusivamente <strong>cookie tecnici</strong>{" "}
              necessari per l&apos;autenticazione e il funzionamento
              dell&apos;app. Non vengono utilizzati cookie di profilazione o di
              terze parti a scopo pubblicitario.
            </p>
            <p className="mt-2">
              Inoltre, l&apos;app utilizza il <strong>localStorage</strong> del
              browser per salvare preferenze locali come il tracker
              dell&apos;acqua, lo stato di accettazione dei consensi e altre
              impostazioni dell&apos;interfaccia.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-semibold text-foreground text-lg mb-2">{title}</h2>
      <div className="text-sm text-foreground-muted leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
