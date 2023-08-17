# Sample application to show Istio / Service Mesh

## Istio / Service mesh capabilities demonstrated
- Traffic routing 80/20 (canary deployment) between app v1 and v2
- Traffic routing based on header for app v3
- Mirror traffic from app v3 to app v4 without app v4 having to respond to client requests.

## Sample app capabilities
- Health check endpoint
- Respond with message based on env variable (GET request)
- Echo endpoint (POST request)
- Log incoming requests to stdout
- Containerised

## How to build app 
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

Finally, replace all image references in all [deployments](./k8s_resources/) with your image tag.<br>
Once done, commit your changes to your git repository, such that ArgoCD can pick up these changes.

## How to test different capabilities
Set your BASE_URL to wherever your app is running. For example http://localhost:8080
```
export BASE_URL=http://localhost:8080
```
### 80/20 traffic routing
Send 50 requests and see that roughly 80% are responded from app v1 and the rest from app v2
```
for x in {1..50}
do
curl ${BASE_URL}/api/v1
done
```

### Header based traffic routing
```
curl -H "env: dev" ${BASE_URL}/api/v1
```

### Traffic mirroring of app v3
Watch the app v4's terminal output (stdout) and see how requests targeting app v3 are mirrored to app v4. 
App v3 responds the client request but app v4 receives a copy of the request. This is great for "testing in production"
```
curl -X POST -H 'Content-Type: application/json' -H 'env: dev' -d '{"message": {"value": "asdf"}}' ${BASE_URL}/api/v1/echo
```