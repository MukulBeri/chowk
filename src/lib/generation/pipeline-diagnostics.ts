import {z} from 'zod';

// Public diagnostics are a closed vocabulary and bounded numbers, never messages,
// file paths, rejected content, headers, prompts or image payloads.
export const pipelineDiagnosticSchema=z.strictObject({
 stage:z.enum(['response-contract','base64','png-header','metadata-policy','worker-bootstrap','worker-runtime','native-decode','image-fit','xmp-preservation','asset-schema','campaign-schema']),
 code:z.enum(['invalid-response','response-too-large','invalid-encoding','invalid-png','metadata-refused','module-resolution','worker-failed','decode-failed','busy','fit-exhausted','xmp-changed','schema-rejected','timeout','aborted']),
 sourceBytes:z.number().int().min(0).max(100_000_000).optional(),
 outputBytes:z.number().int().min(0).max(100_000_000).optional(),
 width:z.number().int().min(0).max(100_000).optional(),height:z.number().int().min(0).max(100_000).optional(),
 elapsedMs:z.number().finite().min(0).max(120_000).optional(),
});
export type PipelineDiagnostic=z.infer<typeof pipelineDiagnosticSchema>;
export function pipelineDiagnostic(value:PipelineDiagnostic):PipelineDiagnostic{return pipelineDiagnosticSchema.parse(value);}
