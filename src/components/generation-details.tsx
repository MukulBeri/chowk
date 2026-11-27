import type {GenerationResult} from '../lib/generation/contracts';

export function GenerationDetails({generation}:{generation:GenerationResult}){
 const sources=generation.interpretationSources;
 return <details><summary>Creative plan and generation details</summary>
  <p>{generation.metadata.fallbackReason?`Reason: ${generation.metadata.fallbackReason.replaceAll('-',' ')}. `:''}{generation.metadata.warnings.join(' ')}</p>
  {sources&&<><h3>Application-owned brief interpretation</h3><p>Local interpretation and factual safeguards remain separate from creative model decisions.</p></>}
  {sources?.creative&&<section aria-label="Accepted model interpretation"><h3>Accepted Meta creative interpretation</h3><p>Model: {sources.creative.model}</p><p>{sources.creative.rationale}</p><p>{sources.creative.interpretation.concept}</p><ul>{sources.creative.interpretation.assumptions.map((value,index)=><li key={index}>{value}</li>)}</ul></section>}
  {sources&&!sources.creative&&<p>No accepted model creative interpretation is available for this campaign.</p>}
  <pre tabIndex={0}>{JSON.stringify({interpretation:generation.interpretation,...(sources?{interpretationSources:sources}:{}),metadata:generation.metadata},null,2)}</pre>
 </details>;
}
