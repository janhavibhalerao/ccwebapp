Setup:
1. Install java & set java_home
2. Install Jmeter

How to Execute load testing on API:
1. Start Jmeter. cd Apache-jmeter/bin & ./jmeter
2. In test plan create thread group. Enter values for number of thread, Ramp-up, thread count.
3. Create HTTP request under test plan.
4. Enter server name(your domain), Protocol(http/https), path(eg. /v1/user), body data.
5. Create HTTP autherization Manager & enter credential with base URL.
6. Create HTTP Header Manager & set Content-Type as application/json.
7. Additionally you can create Graph, Tree or Table structure to view result.
8. Save the test plan & Run. 