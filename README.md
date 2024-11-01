# service-mesh-demo

A demo of OpenShift Service Mesh deployed using GitOps. <br>
Istio is an open source service mesh that uses a proxy to intercept all your network traffic, allowing a broad set of application-aware features based on configuration you set.

![Istio architecture](https://istio.io/latest/docs/ops/deployment/architecture/arch.svg)

## Key Features

- Traffic [routing 80/20](#8020-traffic-routing) (canary deployment) between application versions v1 / v2
- Traffic [routing based on request header](#header-based-routing) for app v3
- [Mirror traffic](#mirroring-traffic) from app v3 to app v4 without app v4 having to respond to client requests.
- [Chaos testing](#chaos-testing): fake HTTP 5XX responses.
- [Automatic retry](#automatic-retry) on failed requests.
- [Automatic deployment](/gitops/) via ArgoCD (GitOps)
- Automatic container image [build pipeline](/ci/) (Tekton)
- Kiali Dashboard to [visualize request flows](#kiali-dashboard)

## How to setup

1. Install [ArgoCD Operator](/gitops/README.md)
2. Link the ArgoCD Repository
3. Let ArgoCD deploy all [sample-app resources](/sample-app/k8s_resources)

## How to show

After deploying the service mesh and various application versions, you can showcase the different capabilities using the `curl` requests below.

Note that all requests go to the same endpoint. Traffic routing is done on the server side using a [virtual service](service-mesh/control-plane/virtual-service.yaml).

#### 80/20 traffic routing

![80-20-traffic-routing.png](docs/images/80-20-traffic-routing.png)

Send 10 requests to the app's v1 endpoint

```bash
export SERVICE_MESH_INGRESS_GW=$(kubectl -n istio-system get route istio-ingressgateway -o jsonpath="{ .spec.host }")

for i in $(seq 10); do curl http://${SERVICE_MESH_INGRESS_GW}/api/v1; done
```

And see that the applied [virtual service](service-mesh/control-plane/virtual-service.yaml) routes approximately 80% to v1 whereas 20% of the responses come from v2. This can be useful for canary deployments.

```bash
$ for i in $(seq 10); do curl http://${SERVICE_MESH_INGRESS_GW}/api/v1; done
Hello my version is: v1
Hello my version is: v2
Hello my version is: v2
Hello my version is: v1
Hello my version is: v1
Hello my version is: v1
Hello my version is: v1
Hello my version is: v2
Hello my version is: v1
Hello my version is: v1
```

#### Header based routing

Send a request with the correct header to make the virtual service route traffic to version 3 of the app. This could especially be useful for testing.

```bash
curl -H "env: dev" http://${SERVICE_MESH_INGRESS_GW}/api/v1
```

The response might surprise you. It says its version is development. This is because traffic was routed to v3 of the app, which hard-coded its environment variable `VERSION` in the [deployment-v3.yaml](sample-app/k8s_resources/deployment-v3.yaml#L32)

```bash
$ curl -H "env: dev" http://${SERVICE_MESH_INGRESS_GW}/api/v1
Hello my version is: development
```

#### Mirroring traffic

Continuing the previous example, you'll see that traffic to v3 was mirrored to the app's v4. Important to stress here is, that v4 never answers to client requests. This is still only done by v3.
Mirroring requests enables you to observe your app handling live requests in a production-like environment.

Send the same request from the previous header-based traffic routing example and then extract the logs of the app's v4 pod.

```bash
$ curl -H "env: dev" http://${SERVICE_MESH_INGRESS_GW}/api/v1
Hello my version is: development
$ kubectl logs -l version=v4 | grep -v /healthz
::ffff:127.0.0.6 - - [19/Aug/2024:14:39:09 +0000] "GET /api/v1/ HTTP/1.1" 200 28 "-" "curl/8.7.1"
```

#### Chaos testing

![chaos-testing.png](docs/images/chaos-testing.png)
To test your app's resiliency to handle faulty HTTP responses, you can inject faulty HTTP 5XX responses. The following request should result in 75% HTTP 503 responses

```bash
for i in $(seq 10); do curl -s -o /dev/null -w "HTTP %{http_code}\n" -H "fail: true" http://${SERVICE_MESH_INGRESS_GW}/api/v1; done
```

The above `curl`request only returns the HTTP status code. As you can see roughtly 3/4 of the requests fail intentionally.

```bash
$ for i in $(seq 10); do curl -s -o /dev/null -w "HTTP %{http_code}\n" -H "fail: true" http://${SERVICE_MESH_INGRESS_GW}/api/v1; done
HTTP 503
HTTP 503
HTTP 503
HTTP 503
HTTP 503
HTTP 503
HTTP 503
HTTP 200
HTTP 200
HTTP 503
```

#### Automatic retry

In a distributed world it has to be expected that requests fail from time to time. To free the developers of having to implement the retry logic themselves over and over again, you can outsource this logic to the service mesh.

The app's `/api/v1/fail` endpoint is designed to fail 75% of the times by returning a HTTP 503 server error message.
Traffic to this endpoint will be routed by the service mesh to `v6` and there's an automatic retry policy that retries 5 times in case of pre-defined errors. Thus, the client will not even realize that 75% of the requests fail.

Test the endpoint by sending 4 requests to the `/api/v1/fail` endpoint and observe that each request succeeds.

```bash
$ for i in $(seq 4); do curl http://${SERVICE_MESH_INGRESS_GW}/api/v1/fail; done
Hello my version is: v6
Hello my version is: v6
Hello my version is: v6
Hello my version is: v6
```

When looking at the v6 pod's logs on the otherhand, we see that the majority of the requests failed but the service mesh automatically retried the requests on failures.

```log
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:02 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:02 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 200 24 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 200 24 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 200 24 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 503 19 "-" "curl/8.7.1"
::ffff:127.0.0.6 - - [20/Aug/2024:08:31:03 +0000] "GET /api/v1/fail HTTP/1.1" 200 24 "-" "curl/8.7.1"
```

## Kiali Dashboard

![kiali-home.png](docs/images/kiali-dashboard.png) <br>
To visualize the various request flows, you can use the Kiali dashboard. Extract the Kiali URL using

```bash
kubectl -n istio-system get route kiali -o jsonpath='{ .spec.host }{"\n"}'
```

## Customize the demo

If you want to modify the sample-app, you need to rebuild and republish the container image<br>

#### Continious Integration

To automatically build the app from source, check out the [Continuous Integration (CI)](ci/README.md) section of this repository.

#### Manual build and push

To manually build the container image you need `docker` or `podman`. Both binaries can be used interchangeably.

```bash
export CR=quay.io
export CR_USER=raphael_tholl
export IMAGE_NAME=sample-app
export TAG=latest

podman build -t ${CR}/${CR_USER}/${IMAGE_NAME}:${TAG} sample-app/
podman push ${CR}/${CR_USER}/${IMAGE_NAME}:${TAG}
```

## Author

[Raphael Tholl](https://github.com/RapTho)
