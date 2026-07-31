# Logo retangular sem crop forçado: design

Data: 2026-07-31. Relacionado: [`CLAUDE.md`](../../../CLAUDE.md) §5 (design tokens, logo circular 36px — desvio documentado aqui), [`2026-07-20-ajustes-admin-design.md`](./2026-07-20-ajustes-admin-design.md) (origem do `ImageUploadField` com crop obrigatório e do `LogoMark`).

## Objetivo

A logo real do ministério (fornecida pelo usuário) é um wordmark largo (~10:1, "PR XURDIR" desenhado), não um ícone quadrado. O fluxo atual força crop `1/1` e renderiza num círculo de 36px — inutilizável pra essa arte. Três mudanças:

1. Upload de logo sem crop forçado — sobe a imagem original, sem restringir proporção.
2. `LogoMark` renderiza a imagem no formato original (sem máscara circular), limitada só por altura.
3. Admin ganha opção de esconder o nome do ministério ao lado da logo (a arte já traz o nome escrito).

## Decisões desta fase

- **Desvio de protótipo registrado** (exigido por CLAUDE.md §13): o protótipo define logo circular 36px (§5). Esta mudança é pedido explícito do usuário pra suportar uma logo real que não é um ícone — a badge circular "U"/inicial **continua sendo o fallback** quando não há `logoUrl`, preservando o visual original pra esse caso.
- **`ImageUploadField.aspectRatio` vira opcional.** Quando ausente: pula inteiramente o `Dialog` de crop (`react-easy-crop`) — o arquivo original vai direto pro upload, sem gerar Blob via canvas. Os 6 usos existentes (sobre, agenda, livros, vídeo — todos passam `aspectRatio` hoje) continuam idênticos. Só o campo de logo do rodapé passa a omitir a prop.
- **Preview do campo, sem crop**: a miniatura de 112px quadrada (`style={{aspectRatio}}`, `object-cover`) não faz sentido pra uma imagem livre — quando não há `aspectRatio`, a miniatura vira uma caixa com altura fixa e `object-contain` (mostra a imagem inteira, sem cortar), e o clique nela deixa de abrir crop (não existe mais nada pra recortar); só o botão "Trocar" permanece como forma de substituir o arquivo.
- **`LogoMark` recebe duas props novas**: `size?: 'nav' | 'footer'` (default `'nav'`) e `showText?: boolean` (default `true`).
  - Com `logoUrl`: `<img>` com altura fixa por `size` (`nav` = 36px / `footer` = 48px), largura automática, `object-contain`, sem `rounded-full`.
  - Sem `logoUrl` (fallback): mantém a badge circular com inicial, mas o tamanho do círculo também respeita `size` (36px / 48px) — consistência entre os dois estados.
- **`showLogoText` é um campo novo em `FooterSettings`** (`Boolean @default(true)`), não em `HeaderSettings` — junto do `logoUrl`, que já mora ali (mesma decisão de FR-23: "singleton de identidade/marca do site"). Controla o `<span>` do nome do ministério tanto no `Navbar` quanto no `Footer` (mesma flag pros dois lugares, sem duplicar configuração).
- **Altura do footer (48px) diferente do navbar (36px)**: pedido explícito — o footer tem mais espaço vertical e a logo merece mais destaque ali.
- **Sem validação de proporção/dimensão mínima** no upload sem crop — só o limite de tamanho de arquivo (5MB) já existente se aplica. Confiar no usuário pra escolher uma imagem com proporção razoável pra um wordmark de logo (não é um campo de conteúdo público arbitrário).

## Estrutura de arquivos

```
components/
  admin/
    image-upload-field.tsx     # aspectRatio: number → number | undefined
                                # sem aspectRatio: pula Dialog/Cropper, upload direto do File original
                                # preview sem aspectRatio: altura fixa + object-contain, sem affordance de re-crop
    footer-settings-form.tsx   # ImageUploadField do logo sem aspectRatio; + Switch "Mostrar nome do
                                # ministério ao lado da logo" ligado a showLogoText
  brand/
    logo-mark.tsx              # + props size ('nav' | 'footer', default 'nav'), showText (default true)
                                # img sem crop: h-9/h-12 conforme size, w-auto, object-contain, sem rounded-full
                                # fallback "U": círculo size-9/size-12 conforme size
  navbar/
    navbar.tsx                  # + prop showLogoText, repassa pro LogoMark (size='nav' já é o default)
  footer/
    footer.tsx                  # + prop showLogoText, repassa pro LogoMark com size="footer"
app/
  page.tsx                      # passa footer.showLogoText pros dois: <Navbar showLogoText /> e <Footer showLogoText />
lib/
  schemas/footer-settings.ts    # + showLogoText: z.boolean()
  content/footer.ts             # sem mudança de código — tipo FooterSettings do Prisma já reflete o campo novo
  actions/footer-settings.ts    # sem mudança de código — update já usa parsed.data (spread)
app/admin/(dashboard)/rodape/page.tsx  # initialValues + showLogoText: settings.showLogoText
prisma/
  schema.prisma                 # FooterSettings.showLogoText Boolean @default(true) (nova migration)
```

## Fora de escopo

- Não muda nenhum dos outros 6 campos de upload com crop (sobre, agenda, livros, vídeo) — comportamento e `aspectRatio` de cada um continuam exatamente como estão.
- Não adiciona filtro CSS de cor/inversão — usuário confirmou que vai fornecer a versão clara/branca da logo separadamente, pro fundo escuro do site.
- Não normaliza nem redimensiona a imagem no upload sem crop além do limite de 5MB já existente.

## Definição de pronto

- `bunx oxlint` sem erros, `bun test` passando.
- Upload de logo sem crop testado manualmente: arquivo retangular sobe, aparece no navbar (36px altura) e footer (48px altura) sem cortar nem distorcer.
- Toggle `showLogoText` testado: ligado mostra nome, desligado esconde, nos dois lugares.
- Fallback (sem `logoUrl`) continua mostrando o círculo com inicial, nos dois tamanhos.
- Revalidação sob demanda confirmada (salvar no admin → site público atualiza sem rebuild).
