import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4f35b1fc/health", (c) => {
  return c.json({ status: "ok" });
});

// Save uploaded activity data (overwrites previous submission for the business unit)
app.post("/make-server-4f35b1fc/activity-data/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { projectId, businessUnitId, calculatedData, uploadedBy, timestamp } = body;

    if (!projectId || !businessUnitId || !calculatedData) {
      return c.json({ error: "Missing required fields: projectId, businessUnitId, calculatedData" }, 400);
    }

    // Create a unique key for this business unit's data
    const key = `activity_data:${projectId}:${businessUnitId}`;
    
    // Save the data (overwrites any previous submission)
    await kv.set(key, {
      projectId,
      businessUnitId,
      calculatedData,
      uploadedBy,
      timestamp,
    });

    console.log(`Activity data saved successfully for project ${projectId}, business unit ${businessUnitId}`);
    return c.json({ success: true, message: "Activity data saved successfully" });
  } catch (error) {
    console.error("Error saving activity data:", error);
    return c.json({ error: `Failed to save activity data: ${error}` }, 500);
  }
});

// Get uploaded activity data for a specific business unit
app.get("/make-server-4f35b1fc/activity-data/:projectId/:businessUnitId", async (c) => {
  try {
    const { projectId, businessUnitId } = c.req.param();

    if (!projectId || !businessUnitId) {
      return c.json({ error: "Missing required parameters: projectId, businessUnitId" }, 400);
    }

    const key = `activity_data:${projectId}:${businessUnitId}`;
    const data = await kv.get(key);

    if (!data) {
      return c.json({ error: "No data found for this business unit" }, 404);
    }

    console.log(`Activity data retrieved for project ${projectId}, business unit ${businessUnitId}`);
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error retrieving activity data:", error);
    return c.json({ error: `Failed to retrieve activity data: ${error}` }, 500);
  }
});

// Get all business units with uploaded data for a project
app.get("/make-server-4f35b1fc/activity-data/:projectId", async (c) => {
  try {
    const { projectId } = c.req.param();

    if (!projectId) {
      return c.json({ error: "Missing required parameter: projectId" }, 400);
    }

    const prefix = `activity_data:${projectId}:`;
    const allData = await kv.getByPrefix(prefix);

    console.log(`Retrieved ${allData.length} business unit data entries for project ${projectId}`);
    return c.json({ success: true, data: allData });
  } catch (error) {
    console.error("Error retrieving project activity data:", error);
    return c.json({ error: `Failed to retrieve project activity data: ${error}` }, 500);
  }
});

// Add comment/remark to a specific parameter row
app.post("/make-server-4f35b1fc/activity-data/comment", async (c) => {
  try {
    const body = await c.req.json();
    const { projectId, businessUnitId, activityUID, parameterId, comment, commentedBy, role, timestamp } = body;

    if (!projectId || !businessUnitId || !activityUID || !parameterId || !comment || !commentedBy || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Get existing data
    const dataKey = `activity_data:${projectId}:${businessUnitId}`;
    const existingData = await kv.get(dataKey);

    if (!existingData) {
      return c.json({ error: "No data found for this business unit" }, 404);
    }

    // Update the calculatedData to include the comment
    const updatedCalculatedData = existingData.calculatedData.map((activity: any) => {
      if (activity.activityUID === activityUID) {
        // Update the specific parameter with the comment
        const updatedParameters = activity.inputParameters.map((param: any) => {
          if (param.parameterId === parameterId) {
            // Initialize remarks array if it doesn't exist
            const remarks = param.remarks || [];
            // Add new comment
            remarks.push({
              id: `remark-${Date.now()}`,
              comment,
              commentedBy,
              role, // 'sa' or 'customer'
              timestamp: timestamp || new Date().toISOString()
            });
            return { ...param, remarks };
          }
          return param;
        });
        return { ...activity, inputParameters: updatedParameters };
      }
      return activity;
    });

    // Save updated data
    await kv.set(dataKey, {
      ...existingData,
      calculatedData: updatedCalculatedData
    });

    console.log(`Comment added successfully for parameter ${parameterId}`);
    return c.json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ error: `Failed to add comment: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);