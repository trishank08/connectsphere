### ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

### ---------- Run stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S connectsphere && adduser -S connectsphere -G connectsphere
COPY --from=build /app/target/connectsphere-backend.jar app.jar
RUN mkdir -p /app/uploads && chown -R connectsphere:connectsphere /app
USER connectsphere
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
