# README.md

# Projekt Ormen C Nivå

## Översikt
Projektet "Ormen C Nivå" är en utvidgning av det klassiska spelet Snake. Spelet spelas på en canvas där spelaren styr en orm som växer när den äter mat. Målet är att samla så mycket mat som möjligt utan att krocka med sig själv eller kanterna på spelplanen. Denna version introducerar olika frukter som mat, vilket gör spelet mer varierat och intressant.

## Filstruktur
- `index.html`: Innehåller strukturen för webbsidan, inklusive canvas-elementet för spelet och en knapp för att starta/pausa spelet.
- `css/snake.css`: Innehåller stilar för body, canvas och knapp för att centrera canvasen och förbättra användarinteraktionen.
- `js/main.js`: Innehåller huvudlogiken för spelet, inklusive initiering av spelet, hantering av ormens rörelse, matgenerering och kollisiondetektering. En ny funktion för att randomisera frukten har lagts till.
- `js/foodImage.js`: Hanterar inläsning och export av fruktbilder för spelet.
- `images/apple.png`: En bild av ett äpple, som används som en av matvarorna i spelet.
- `images/banana.png`: En bild av en banan, som används som en av matvarorna i spelet.
- `images/cherry.png`: En bild av ett körsbär, som används som en av matvarorna i spelet.
- `images/strawberry.png`: En bild av en jordgubbe, som används som en av matvarorna i spelet.

## Funktioner
- **Start/Pause-knapp**: Användaren kan starta och pausa spelet med en knapp.
- **Orm och mat**: En orm ritas ut på canvasen och mat slumpas ut på olika positioner med olika frukter.
- **Rörelse**: Ormen kan styras med piltangenterna.
- **Poängsystem**: Spelet håller reda på hur mycket mat som har samlats.

## Så här kör du spelet
1. Öppna `index.html` i en webbläsare.
2. Klicka på "Start"-knappen för att börja spelet.
3. Använd piltangenterna för att styra ormen.
4. Samla mat för att öka poängen och längden på ormen.

## Framtida Utveckling
Projektet är strukturerat för att enkelt kunna utökas med fler funktioner och nivåer. Planerade förbättringar inkluderar:
- Kollision med sig själv.
- Slumpmässigt placerade hinder.
- Flera nivåer med olika svårighetsgrader.
- Fler spelalternativ och inställningar.

## Licens
Detta projekt är licensierat under MIT-licensen.