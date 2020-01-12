mystrom_proxy

## Launching the bridge in a docker:
Build a docker and run it, including some env variable (see above).
The default docker file is for raspberry-pi, but you can use Dockerfile_x86 to use a mode standard docker image (nodejs).

```bash
docker build . -t ms_bridge

docker run -d rm --name ms_bridge
    --env HASS_TOKEN=Long-lived_access_token \
    --env HASS_ADDR=address_of_the_ass_instance \
    -p 8080:8080 \
    ms_bridge
```

* Long-lived_access_token: a hass token as in [Authentication API · Home Assistant dev docs](https://developers.home-assistant.io/docs/en/auth_api.html#long-lived-access-token)
* address_of_the_ass_instance: ip address of the home assitant intant (including the port i.e. 192.168.0.2:8123).

## Register a button
To setup a button you can use the register script, either directly or using the docker image. 
The setup process is inspired from [myStrom - Home Assistant](https://www.home-assistant.io/integrations/mystrom/#binary-sensor)

In either case, you need to define three env variable:
* BUTTON_ID: the id of the button, that will be used in hass (button_id).
* BRIDGE_ADDR: the ip address of the device running the bridge.
* BUTTON_ADDR: the ip address of the button, the MAC address will be requested automatically.

```bash
docker run -it --entrypoint node \
    --env BUTTON_ID=0 \
    --env BRIDGE_ADDR=192.168.0.2:8080 \
    --env BUTTON_ADDR=192.168.0.105 node  \
    ms_bridge src/register.js
```