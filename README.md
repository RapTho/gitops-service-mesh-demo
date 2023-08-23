# service-mesh-demo

A demo of OpenShift Service Mesh deployed using GitOps

## Capabilities demonstrated

- Traffic routing 80/20 (canary deployment) between application versions v1 / v2
- Traffic routing based on request header for app v3
- Mirror traffic from app v3 to app v4 without app v4 having to respond to client requests.

## Steps to reproduce

1. Install [ArgoCD Operator](/gitops/README.md)
2. Link the ArgoCD Repository
3. Let ArgoCD deploy all [sample-app resources](/sample-app/)

## Modify sample-app

If you want to modify the sample-app, you need to rebuild and republish the container image<br>

Enter the following information as environment variable

```
export CR=quay.io
export UN=raphael_tholl
export IMAGE_NAME=sample-app
export TAG=latest
```

After you applied your changes to the source code perform the following steps. Use a container engine such as [podman](https://podman.io)

```
podman login ${CR}
podman build -t ${CR}/${UN}/${IMAGE_NAME}:${TAG} /path/to/Containerfile
podman push ${CR}/${UN}/${IMAGE_NAME}:${TAG}
```

## Author

[Raphael Tholl](https://github.com/RapTho)
