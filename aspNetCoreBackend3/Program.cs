using MongoDB.Driver;
using Megagram.Services;
using Megagram.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
        {
        options.AddPolicy("AllowSpecificOrigin",
                builder =>
                {
                builder.WithOrigins("http://localhost:8011")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
        });


// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var mongoDbConnectionString = builder.Configuration.GetConnectionString("MongoDBConnection");

var mongoClient = new MongoClient(mongoDbConnectionString);

var mongoDatabase = mongoClient.GetDatabase("Megagram");

var currentlyActiveSessionKeys = mongoDatabase.GetCollection<CurrentlyActiveSessionKey>("currentlyActiveSessionKeys");

builder.Services.AddSingleton<IMongoCollection<CurrentlyActiveSessionKey>>(currentlyActiveSessionKeys);

builder.Services.AddSingleton<MegaDBService>();

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
        app.UseSwagger();
        app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
