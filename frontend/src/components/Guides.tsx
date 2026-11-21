export default function Guides() {
  const resources = [
    ["ICMBio • PARNASO", "Monitoramento e Apoio no Entorno", "Orientação técnica para propriedades vizinhas ao Parque Nacional da Serra dos Órgãos.", "Av. Rotariana, s/n • Soberbo, Teresópolis"],
    ["Emater-Rio • Teresópolis", "Assistência Técnica e Cercamento", "Apoio gratuito sobre cercas elétricas solares, abrigos e manejo rural.", "Escritório Local • Bonsucesso / Centro"],
    ["INEA & Lei 9.605/98", "Legislação Ambiental e Resgate", "A fauna silvestre é protegida por lei. Em caso de animal ferido ou risco iminente, acione os órgãos ambientais.", "Linha Verde IBAMA: 0800 061 8080"]
  ] as const;
  return (
    <div className="stack guides-resources">
      {resources.map(([org, title, description, contact]) => (
        <article className="box guide-resource" key={title}>
          <span>{org}</span>
          <h3>{title}</h3>
          <p>{description}</p>
          <small>{contact}</small>
        </article>
      ))}
    </div>
  );
}
