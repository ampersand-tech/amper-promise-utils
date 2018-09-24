# amper-promise-utils
Ampersand's utility functions for using promises and async-await.

## parallel()
Waits for all promises passed in to settle (unlike Promise.all, which will reject immediately upon first error).

## parallelWithErrors()
Waits for all promises passed in to settle (unlike Promise.all, which will reject immediately upon first error).
Returns errors instead of throwing them, so caller can cleanup anything that succeeded.

## class ParallelQueue
Runs async jobs in parallel, with a maximum parallelization count. Requires jobs to be added by function name and parameters, so they can be started later.
```
const jobs = new ParallelQueue(10);
for (const userID of users) {
  jobs.collate(userID, fetchUserInfo, userID);
}
const userInfos = await jobs.run();
for (const userID in userInfos) {
  console.log(userInfos[userID]); // fetched user info
}
```

## forever()
Returns a Promise that never resolves; used in cases where you want to enter an infinite event-handling loop.

## sleep(ms: number)
A Promise-wrapped version of setTimeout.

## class ActionTimeout
Runs an async function but early-out rejects if it takes longer than some timeout.

## ignoreError()
Used to wrap a Promise with another Promise that will resolve instead of reject if the original Promise rejects with an error that matches any of the given error strings.

```
const val = await ignoreError(someAsyncFunc(arg0, arg1), 'not found', 'offline');
```

## withError()
Used to wrap a Promise such that it returns any error instead of throwing it.

```
const { err, data } = await withError(someAsyncFunc(arg0, arg1));
if (err) { ... }
```
