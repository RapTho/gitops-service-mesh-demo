# Install GitOps

**GitOps Operator = Red Hat's version of ArgoCD**

Create the operator by applying the [subscription.yaml](subscription.yaml)

```
oc apply -f subscription.yaml
```

# Link Git repo to ArgoCD

```
oc apply -f argocd-repository.yaml
```

# Create applications

```
oc apply -f argo-apps/
```

# Open ArgoCD

To watch what's happening you can open ArgoCD's user interface. You can get the link by executing the extraction command below.

```
oc get route/openshift-gitops-server -n openshift-gitops -o jsonpath='{.spec.host}{"\n"}'
```

# Login credentials for ArgoCD admin user

username: admin

Extract the password

```
oc extract secret/openshift-gitops-cluster -n openshift-gitops --keys=admin.password --to=-
```
