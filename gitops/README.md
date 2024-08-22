# Install GitOps

**GitOps Operator = Red Hat's version of ArgoCD**

Create the operator by applying the [subscription.yaml](subscription.yaml)

```
kubectl apply -f subscription.yaml
```

# Link Git repo to ArgoCD

```
kubectl apply -f argocd-repository.yaml
```

# Let ArgoCD deploy all ressources

```
kubectl apply -f argo-apps/
```

# Open ArgoCD

To watch what's happening you can open ArgoCD's user interface. You can get the ArgoCD UI URL by executing the extraction command below. This works on OpenShift only.

```
oc get route/openshift-gitops-server -n openshift-gitops -o jsonpath='{ .spec.host }{"\n"}'
```

# Login credentials for ArgoCD admin user

username: admin

Extract the password

```
kubectl extract secret/openshift-gitops-cluster -n openshift-gitops --keys=admin.password --to=-
```
