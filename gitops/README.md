# Install GitOps

**GitOps Operator = Red Hat's version of ArgoCD**

Create Operator with [subscription.yaml](subscription.yaml)

```
oc apply -f subscription.yaml
```

# Open ArgoCD

Open ArgoCD User Interface using firefox.

```
ARGO=$(oc get route/openshift-gitops-server -n openshift-gitops -o jsonpath='{.spec.host}{"\n"}')
firefox $ARGO &
```

# Login credentials for ArgoCD admin user

username: admin

Extract the password

```
oc extract secret/openshift-gitops-cluster -n openshift-gitops --keys=admin.password --to=-
```

# Link Git repo to ArgoCD

```
oc apply -f argocd-repository.yaml
```

# Create applications

```
oc apply -f argo-apps
```
