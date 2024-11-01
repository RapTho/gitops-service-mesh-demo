# Sample application to show Istio / Service Mesh

## Istio / Service mesh capabilities demonstrated

See [root README.md](../README.md) for highlights.

## Sample app capabilities

- Health check endpoint
- Respond with message based on env variable (GET request)
- Echo endpoint (POST request)
- Log incoming requests to stdout
- Containerised

## How to build app

### Automated build (CI)

Follow the instructions documented [here](../ci/)

### Manual build

Install podman or use docker instead: https://podman.io <br>

Login to your container registry

```
podman login quay.io
```

Tag the container image in the following format: CONTAINER_REGISTRY/USER/IMAGE_NAME:TAG

```
podman build -t quay.io/raphael_tholl/sample-app:latest .
podman push quay.io/raphael_tholl/sample-app:latest
```

### Replace image reference

If you published your own container image, you have to replace all image references in all [deployments](./k8s_resources/) with your image tag.<br>
Once done, commit your changes to your git repository, such that ArgoCD can pick up these changes.
