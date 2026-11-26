# Owner-local credential handoff only. Dot-sourcing or invoking this file does
# not prompt, read a credential, create a transport or dispatch inference.
# This is NOT the live runner or a grant to execute an arbitrary consumer.
# After account prerequisites and the bounded runner have been reviewed, the
# owner may supply that runner as the Consumer. Never send a key through chat.
function Invoke-ChowkM7LCredentialScope {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$PrerequisitesPath,
        [Parameter(Mandatory = $true)][scriptblock]$Consumer
    )
    $ErrorActionPreference = 'Stop'
    $facts = Get-Content -LiteralPath $PrerequisitesPath -Raw | ConvertFrom-Json
    if ($facts.authorization -ne 'M7-L-four-dispatches-20261126' -or
        $facts.accountEligibilityConfirmed -ne $true -or
        $facts.regionalEligibilityConfirmed -ne $true -or
        $facts.currentModelsConfirmed -ne $true -or
        $facts.noPaidBillingSubscriptionOrTopUpConfirmed -ne $true -or
        $facts.secureCredentialAvailableConfirmed -ne $true -or
        $facts.offlineIntegrationVerified -ne $true -or
        $null -eq $facts.promotionalBalanceUsd -or
        [decimal]$facts.promotionalBalanceUsd -lt [decimal]0.20) {
        throw 'M7-L prerequisites incomplete. No credential access or dispatch.'
    }
    if (Test-Path Env:CHOWK_M7L_EPHEMERAL_KEY) {
        throw 'Unexpected existing credential handoff; stop without replacing it.'
    }
    $secret = $null
    $pointer = [IntPtr]::Zero
    try {
        $secret = Read-Host 'Enter the existing Meta key locally (hidden; never logged)' -AsSecureString
        if ($secret.Length -eq 0) { throw 'No credential supplied.' }
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
        $env:CHOWK_M7L_EPHEMERAL_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        & $Consumer
    }
    finally {
        Remove-Item Env:CHOWK_M7L_EPHEMERAL_KEY -ErrorAction SilentlyContinue
        if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
        if ($null -ne $secret) { $secret.Dispose() }
    }
}
# Consumers must remove this inherited environment entry before launching any
# browser. Environment/.NET string clearing is not guaranteed memory erasure.
# A consumer still needs its own durable reservation ledger, fixed endpoint/model
# allowlist, A<=2/B<=2/global<=4, estimated <=$0.20 and stop-on-uncertainty logic.
