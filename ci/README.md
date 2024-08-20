## Pre-requisites

Ensure your cluster meets the following requirements. All `kubectl` commands can also be executed with `oc` instead.

#### Tekton Operator

Install the Tekton operator by creating the following subscription.

```bash
kubectl apply -f - <<EOF
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: openshift-pipelines-operator
  namespace: openshift-operators
spec:
  channel: latest
  name: openshift-pipelines-operator-rh
  source: redhat-operators
  sourceNamespace: openshift-marketplace
EOF

```

#### Tasks

Install task from Tekton Hub

```bash
kubectl apply -n dev -f https://api.hub.tekton.dev/v1/resource/tekton/task/git-clone/0.9/raw
kubectl apply -n dev -f https://api.hub.tekton.dev/v1/resource/tekton/task/kaniko/0.6/raw
```

#### Secret

To authenticate towards your container registry of choice, create a Kubernetes secret. Use the [quay-credentails.yaml](quay-credentials.yaml) as an example.

After logging into your registry with docker or podman, you can use the auth file as the value for the Kuberentes secret.

```bash
cat ~/.docker/config.json | base64
```

## How to use

Follow these steps to automatically build a container image of the sample-app and push it to your desired container registry (CR).

#### Configuration

The [pipelinerun.yaml](pipelinerun.yaml) defines both the `git repository` as well as the `image reference`. To push the final image to another CR, modify [line 25](pipelinerun.yaml#L25) using the following command. If needed, also change the git repository to your own on [line 23](pipelinerun.yaml#L23).

```bash
export IMGREF="myRegistry/myUsername/myImageName:myTag"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|quay.io/raphael_tholl/sample-app:latest|${IMGREF}|g" pipelinerun.yaml
else
  # Linux
  sed -i "s|quay.io/raphael_tholl/sample-app:latest|${IMGREF}|g" pipelinerun.yaml
fi

```

#### Create and execute the pipeline

After creating the secret for your CR and adjusting the CR string in the pipelinerun.yaml create and execute the pipeline

```bash
kubectl apply -f pipeline.yaml
kubectl create -f pipelinerun.yaml
```

## Tekton Pruner

To automatically remove old pipeline runs and their associated persistent volumes, apply the provided TektonConfig with job that runs every 10min.

```bash
kubectl apply -f tektonConfig.yaml
```
