#!/usr/bin/python3
#
import random
import time
import statsd

client = statsd.StatsClient(host='127.0.0.1',port=8125, prefix='test1')
for i in range(0,1000000):
    client.incr('inc1', random.randint(1,5))
    client.incr('inc2', random.randint(1,5))
    client.decr('dec1', random.randint(1,5))
    client.gauge('gauge1', random.randint(1,10))
    client.gauge('gauge2', random.randint(10,20))
    client.timing('timer1', random.randint(1,10))
    client.timing('timer2', random.randint(10,20))
    client.set("set1", random.randint(1,20))
    time.sleep(1)
