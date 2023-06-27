## Label project to be managed by ArgoCD
```
oc label project istio-system argocd.argoproj.io/managed-by=openshift-gitops
```