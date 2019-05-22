# Pact Testing...wat?

This is a presentation overviewing Pact Testing as a methodology. This presentation covers what Pact testing is, common terminology of the Pact ecosystem, upsides, downsides, example implementations and general takeaways from personal experience.

## Presentation

This presentation uses [Deckset](https://www.deckset.com/) to turn the `./presentation.md` markdown file into a working presentation. 

## Example Files

[Example pact unit test](example-files/example-js-consumer-generation-user-test.js): The "unit test" created on the provider side that will run to generate a pact file. "Unit test" is a bit of a misnomer here, while it is a Jest test, it's not really testing anything useful at this stage.

[Example generated pact](example-files/example-pact-file.json): JSON-serialised "pact" or "contract" that was generated from the above unit test. This JSON is ultimately what gets sent and stored by the broker.

## More Info

Below is a list of resources used to research this presentation:

 - [Official Pact Docs (spicy takes inside)](https://docs.pact.io/)
 - [Pact vs Integration](http://io.itv.com/scala-pact/articles/pact-vs-integration.html) 
 - [Consumer driven contract testing using Pact JVM (Youtube)](https://www.youtube.com/watch?v=F-IUh0M-pu8)


