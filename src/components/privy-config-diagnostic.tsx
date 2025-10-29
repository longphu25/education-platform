'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Copy,
  Check
} from 'lucide-react'

export function PrivyConfigDiagnostic() {
  const [testResults, setTestResults] = useState<{
    appIdPresent: boolean
    appIdValid: boolean
    apiReachable: boolean
    domainConfigured: boolean | null
    error?: string
  }>({
    appIdPresent: false,
    appIdValid: false,
    apiReachable: false,
    domainConfigured: null
  })
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState(false)

  const runDiagnostics = async () => {
    setTesting(true)
    
    try {
      // Check if App ID is present
      const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
      const appIdPresent = !!appId
      
      // Validate App ID format (should be alphanumeric with specific length)
      const appIdValid = appId ? /^[a-z0-9]{25}$/.test(appId) : false
      
      // Test Privy API reachability
      let apiReachable = false
      let domainConfigured: boolean | null = null
      let error: string | undefined

      try {
        // Test basic API endpoint
        const apiResponse = await fetch('https://api.privy.io/health', {
          method: 'GET',
        })
        apiReachable = apiResponse.ok

        // Test app-specific endpoint (this will likely fail with 403 if domain not configured)
        if (appId && appIdValid) {
          try {
            const appTestResponse = await fetch('https://auth.privy.io/api/v1/apps/config', {
              method: 'GET',
              headers: {
                'privy-app-id': appId,
                'referer': window.location.origin,
                'origin': window.location.origin,
              },
            })
            
            if (appTestResponse.status === 200) {
              domainConfigured = true
            } else if (appTestResponse.status === 403) {
              domainConfigured = false
              error = 'Domain not configured in Privy Dashboard or invalid App ID'
            } else if (appTestResponse.status === 404) {
              error = 'App ID not found'
            } else {
              error = `Unexpected response: ${appTestResponse.status}`
            }
          } catch (appError) {
            error = appError instanceof Error ? appError.message : 'Network error'
          }
        }
      } catch (apiError) {
        apiReachable = false
        error = apiError instanceof Error ? apiError.message : 'API unreachable'
      }

      setTestResults({
        appIdPresent,
        appIdValid,
        apiReachable,
        domainConfigured,
        error
      })
    } catch (err) {
      setTestResults({
        appIdPresent: false,
        appIdValid: false,
        apiReachable: false,
        domainConfigured: null,
        error: err instanceof Error ? err.message : 'Diagnostic failed'
      })
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Privy Configuration Diagnostic
          </CardTitle>
          <CardDescription>
            Diagnose the 403 Forbidden error from Privy authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Current Configuration */}
          <div className="space-y-3">
            <h4 className="font-medium">Current Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">App ID</div>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  {appId || 'Not configured'}
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm flex items-center gap-2">
                  Current Domain
                  <Button
                    onClick={() => copyToClipboard(currentDomain)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  {currentDomain}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Diagnostic Results</h4>
              <Button 
                onClick={runDiagnostics} 
                disabled={testing}
                variant="outline"
                size="sm"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">App ID Present</div>
                  <div className="text-xs text-muted-foreground">Environment variable set</div>
                </div>
                {testResults.appIdPresent ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    No
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">App ID Format</div>
                  <div className="text-xs text-muted-foreground">25 char alphanumeric</div>
                </div>
                {testResults.appIdValid ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Invalid
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Privy API</div>
                  <div className="text-xs text-muted-foreground">API reachability</div>
                </div>
                {testResults.apiReachable ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Domain Configuration</div>
                  <div className="text-xs text-muted-foreground">Allowed origins</div>
                </div>
                {testResults.domainConfigured === true ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Configured
                  </Badge>
                ) : testResults.domainConfigured === false ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Unknown
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Error Details */}
          {testResults.error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Diagnostic Error:</strong> {testResults.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Solution Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Fix 403 Forbidden Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium mb-2">🔧 Most Likely Solution:</h4>
              <p className="text-sm mb-3">
                The 403 error usually means your domain isn&apos;t configured in the Privy Dashboard.
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privy Dashboard</a></li>
                <li>Select your app: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{appId?.slice(0, 10)}...</code></li>
                <li>Navigate to <strong>Settings → Basics</strong></li>
                <li>In the <strong>Allowed origins</strong> section, add:</li>
                <li className="ml-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block w-fit">
                    {currentDomain}
                  </code>
                </li>
                <li>Save the configuration</li>
                <li>Wait 1-2 minutes for changes to propagate</li>
              </ol>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🔍 Alternative Checks:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Verify your App ID in <code>.env.local</code> matches the Dashboard</li>
                <li>Check if your App Secret is correct (if using server-side features)</li>
                <li>Ensure no typos in environment variable names</li>
                <li>Try clearing browser cache and cookies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}